from __future__ import annotations

from typing import Any, TypedDict

try:
    from langgraph.graph import END, START, StateGraph
    from langgraph.types import interrupt
except Exception:  # pragma: no cover - lets the API run before optional deps are installed
    END = START = None
    StateGraph = None

    def interrupt(value: Any) -> Any:
        return value


class XhsState(TypedDict, total=False):
    project_id: str
    topic_id: str
    step: str
    copy: dict[str, Any]
    image_prompts: list[str]
    images: list[dict[str, Any]]
    feedback: str


def build_xhs_graph():
    """Document the production graph shape used by the API workflow service.

    The first implementation stores review state in SQLite and resumes through
    explicit API calls. This graph definition keeps the LangGraph boundaries
    clear so checkpoint-backed execution can replace the service orchestration
    without changing the UI contract.
    """
    if StateGraph is None:
        return None

    graph = StateGraph(XhsState)

    def draft_copy(state: XhsState) -> XhsState:
        return {**state, "step": "copy_pending_review"}

    def review_copy(state: XhsState) -> XhsState:
        decision = interrupt({"kind": "xhs_copy_review", "topic_id": state.get("topic_id")})
        return {**state, "feedback": decision.get("feedback", "")}

    def draft_images(state: XhsState) -> XhsState:
        return {**state, "step": "images_pending_review"}

    def review_images(state: XhsState) -> XhsState:
        decision = interrupt({"kind": "xhs_images_review", "topic_id": state.get("topic_id")})
        return {**state, "feedback": decision.get("feedback", "")}

    graph.add_node("draft_copy", draft_copy)
    graph.add_node("review_copy", review_copy)
    graph.add_node("draft_images", draft_images)
    graph.add_node("review_images", review_images)
    graph.add_edge(START, "draft_copy")
    graph.add_edge("draft_copy", "review_copy")
    graph.add_edge("review_copy", "draft_images")
    graph.add_edge("draft_images", "review_images")
    graph.add_edge("review_images", END)
    return graph.compile()
