"""
Export API Router.
Exports research paper summaries, comparisons, research gaps, and chat transcripts
in Markdown, TXT, and JSON formats.
"""

import json
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.paper import Paper
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.citation import Citation
from app.services.summarizer import PaperSummarizer
from app.services.gap_analyzer import ResearchGapAnalyzer

router = APIRouter(prefix="/export", tags=["Export"])


class ExportRequest(BaseModel):
    export_type: str  # "summary", "research_gaps", "chat"
    target_id: int = 0
    format: str = "markdown"  # "markdown", "txt", "json"


@router.post("")
def export_research_asset(
    request: ExportRequest,
    db: Session = Depends(get_db)
):
    """
    Exports structured research documents into Markdown, plain text, or JSON.
    """
    fmt = request.format.lower()

    if request.export_type == "summary":
        paper = db.query(Paper).filter(Paper.id == request.target_id).first()
        if not paper:
            raise HTTPException(status_code=404, detail="Paper not found")

        summary_data = PaperSummarizer.generate_summary(paper, db)
        struct = summary_data["structured"]
        beginner = summary_data["beginner"]

        if fmt == "json":
            return PlainTextResponse(
                content=json.dumps(summary_data, indent=2),
                media_type="application/json",
                headers={"Content-Disposition": f"attachment; filename=summary_{paper.id}.json"}
            )

        # Markdown / TXT format
        md_text = f"""# Structured Research Summary: {paper.title}
**Authors:** {paper.authors} | **Year:** {paper.publication_year} | **Pages:** {paper.page_count}

## 1. One-Line Summary
{struct.get('one_line_summary')}

## 2. Abstract Summary
{struct.get('abstract_summary')}

## 3. Research Problem
{struct.get('research_problem')}

## 4. Key Objectives
""" + "\n".join([f"- {obj}" for obj in struct.get('objectives', [])]) + f"""

## 5. Methodology & Architecture
{struct.get('methodology')}

## 6. Datasets & Benchmarks
{struct.get('dataset')}

## 7. Model / Algorithm Formulation
{struct.get('model_or_algorithm')}

## 8. Empirical Results
{struct.get('results')}

## 9. Stated Limitations
{struct.get('limitations')}

## 10. Future Work
{struct.get('future_work')}

## 11. Key Contributions
""" + "\n".join([f"- {c}" for c in struct.get('key_contributions', [])]) + f"""

---
### Beginner-Friendly Analogy
{beginner}
"""
        return PlainTextResponse(
            content=md_text,
            media_type="text/markdown",
            headers={"Content-Disposition": f"attachment; filename=summary_{paper.id}.md"}
        )

    elif request.export_type == "research_gaps":
        gaps_resp = ResearchGapAnalyzer.analyze_gaps(db)

        if fmt == "json":
            return PlainTextResponse(
                content=json.dumps(gaps_resp.model_dump(), indent=2),
                media_type="application/json",
                headers={"Content-Disposition": "attachment; filename=research_gaps.json"}
            )

        md_text = f"""# ResearchAI Literature Gap Discovery Report
**Analyzed Papers:** {gaps_resp.analyzed_papers_count}

## Common Methodologies
""" + "\n".join([f"- {m}" for m in gaps_resp.common_methodologies]) + f"""

## Common Datasets
""" + "\n".join([f"- {d}" for d in gaps_resp.common_datasets]) + f"""

## Discovered Research Gaps
"""
        for gap in gaps_resp.gaps:
            md_text += f"""
### [{gap.confidence_coverage} Evidence] {gap.title}
**Category:** {gap.category}
**Description:** {gap.description}

**Supporting Literature Evidence:**
"""
            for ev in gap.evidence:
                md_text += f"- **{ev.paper_title}** (Page {ev.page_number}, {ev.section_name}): \"{ev.snippet}\"\n"

            md_text += f"\n**Recommended Research Direction:**\n{gap.recommended_future_direction}\n"

        return PlainTextResponse(
            content=md_text,
            media_type="text/markdown",
            headers={"Content-Disposition": "attachment; filename=research_gaps.md"}
        )

    elif request.export_type == "chat":
        conv = db.query(Conversation).filter(Conversation.id == request.target_id).first()
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")

        messages = db.query(Message).filter(Message.conversation_id == conv.id).order_by(Message.created_at.asc()).all()

        md_text = f"# ResearchAI Conversation Transcript: {conv.title}\n**Date:** {conv.created_at.strftime('%Y-%m-%d %H:%M')}\n\n"
        for m in messages:
            sender_label = "Student / Researcher" if m.sender == "user" else "ResearchAI Assistant"
            md_text += f"### {sender_label}:\n{m.content}\n\n"
            citations = db.query(Citation).filter(Citation.message_id == m.id).all()
            if citations:
                md_text += "**Supporting Sources:**\n"
                for c in citations:
                    md_text += f"- [{c.citation_index}] **{c.paper_title}** (Page {c.page_number}, {c.section_name}): \"{c.snippet}\"\n"
                md_text += "\n"

        return PlainTextResponse(
            content=md_text,
            media_type="text/markdown",
            headers={"Content-Disposition": f"attachment; filename=chat_{conv.id}.md"}
        )

    raise HTTPException(status_code=400, detail="Unsupported export type.")
