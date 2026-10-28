"""
LLM abstraction layer supporting OpenAI-compatible APIs (OpenAI, Groq, Ollama, vLLM)
and an intelligent Grounded Demo Synthesis Engine for offline/demo operation.
"""

import logging
import re
import time
from typing import List, Dict, Any, Optional
from app.config import settings

logger = logging.getLogger(__name__)


class LLMService:
    """Unified service for generating grounded research answers and structured summaries."""

    def __init__(self):
        self.client = None
        self._initialize_client()

    def _initialize_client(self):
        """Initializes OpenAI-compatible client if API key is provided."""
        if settings.OPENAI_API_KEY:
            try:
                from openai import OpenAI
                self.client = OpenAI(
                    api_key=settings.OPENAI_API_KEY,
                    base_url=settings.OPENAI_BASE_URL
                )
                logger.info(f"Connected to LLM endpoint: {settings.OPENAI_BASE_URL} (Model: {settings.LLM_MODEL})")
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI client: {e}. Falling back to Demo Mode.")
                self.client = None
        else:
            logger.info("No LLM API key detected. Operating in high-fidelity Grounded Demo Mode.")

    def generate_chat_response(
        self,
        query: str,
        context: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        temperature: float = 0.2
    ) -> str:
        """Generates an answer grounded in the provided research paper chunks."""
        # Check if live LLM API is available and DEMO_MODE is not forced
        if not settings.DEMO_MODE and self.client is not None:
            try:
                system_prompt = (
                    "You are ResearchAI, an expert scientific research assistant. "
                    "Answer the user's question STRICTLY based on the provided research paper excerpts. "
                    "Every claim or fact you state MUST include a citation tag like [1] or [2] corresponding to the source number. "
                    "If the provided context does NOT contain enough information to answer the question, state: "
                    "'I could not find sufficient evidence in the uploaded papers to answer this question.' "
                    "Never hallucinate or extrapolate beyond the provided text."
                )

                messages = [{"role": "system", "content": system_prompt}]

                # Include recent conversation turns for chat memory
                if conversation_history:
                    for turn in conversation_history[-4:]:
                        role = "user" if turn.get("sender") == "user" else "assistant"
                        messages.append({"role": role, "content": turn.get("content", "")})

                messages.append({
                    "role": "user",
                    "content": f"Context:\n{context}\n\nQuestion: {query}\n\nAnswer with citations:"
                })

                response = self.client.chat.completions.create(
                    model=settings.LLM_MODEL,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=settings.MAX_TOKENS
                )
                return response.choices[0].message.content.strip()
            except Exception as e:
                logger.error(f"Live LLM API call failed: {e}. Falling back to Grounded Demo Synthesis.")

        # Grounded Demo Synthesis (Deterministic, grounded NLP extraction)
        return self._grounded_demo_synthesizer(query, context)

    def generate_completion(self, system_prompt: str, user_prompt: str) -> str:
        """Generic completion helper for summarization, comparison, or gap extraction."""
        if not settings.DEMO_MODE and self.client is not None:
            try:
                response = self.client.chat.completions.create(
                    model=settings.LLM_MODEL,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=0.2,
                    max_tokens=settings.MAX_TOKENS
                )
                return response.choices[0].message.content.strip()
            except Exception as e:
                logger.warning(f"Live LLM completion failed: {e}. Using deterministic synthesis.")

        return ""

    def _grounded_demo_synthesizer(self, query: str, context: str) -> str:
        """
        Synthesizes an academic, structured, and properly cited answer directly from retrieved chunks
        without requiring an external API key.
        """
        if not context.strip():
            return "I could not find sufficient evidence in the uploaded papers to answer this question."

        # Parse sources from context
        # Pattern: [Source (\d+)]\nPaper: "(.*?)" \((.*?), (.*?)\)\nPage: (\d+) \| Section: (.*?)\nExcerpt:\n"(.*?)"
        source_pattern = r'\[Source (\d+)\]\s*\nPaper:\s*"(.*?)"\s*\((.*?), (.*?)\)\s*\nPage:\s*(\d+)\s*\|\s*Section:\s*(.*?)\s*\nExcerpt:\s*\n"(.*?)"'
        matches = list(re.finditer(source_pattern, context, re.DOTALL))

        if not matches:
            return "I could not find sufficient evidence in the uploaded papers to answer this question."

        query_lower = query.lower()
        query_words = set(re.findall(r'\b[a-z0-9_\-]{3,}\b', query_lower))

        answer_paragraphs = []

        # Find most relevant sentences from each source
        for match in matches:
            src_num = match.group(1)
            paper_title = match.group(2)
            authors = match.group(3)
            year = match.group(4)
            page_num = match.group(5)
            section = match.group(6)
            excerpt = match.group(7).strip()

            sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', excerpt) if len(s.strip()) > 20]
            if not sentences:
                continue

            # Score sentences by query word overlap
            scored_sentences = []
            for s in sentences:
                s_words = set(re.findall(r'\b[a-z0-9_\-]{3,}\b', s.lower()))
                overlap = len(query_words.intersection(s_words))
                scored_sentences.append((overlap, s))

            scored_sentences.sort(key=lambda x: x[0], reverse=True)
            top_sentence = scored_sentences[0][1] if scored_sentences else sentences[0]

            lead_in = f"According to **{paper_title}** ({section}, Page {page_num}):"
            answer_paragraphs.append(f"{lead_in} \"{top_sentence}\" [{src_num}]")

        if not answer_paragraphs:
            return "I could not find sufficient evidence in the uploaded papers to answer this question."

        synthesis_text = (
            f"Based on the analyzed literature relevant to *\"{query}\"*, the retrieved evidence highlights the following findings:\n\n"
            + "\n\n".join(answer_paragraphs)
            + "\n\n*(Note: Generated via ResearchAI Grounded Synthesis with exact document provenance)*"
        )
        return synthesis_text


# Global singleton instance
llm_service = LLMService()
