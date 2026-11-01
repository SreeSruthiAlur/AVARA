from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from app.schemas.integrations import (
    AstrologyBirthChartRequest,
    AstrologyResponse,
    PlanetPosition,
    HabitsSummaryResponse,
    HabitContractItem,
    InsightsSummaryResponse,
    InsightObservation,
)

# =====================================================================
# TEAMMATE 1 ADAPTER INTERFACES
# =====================================================================

class BaseAstrologyAdapter(ABC):
    """Abstract contract for Astrology calculations and interpretations (Teammate 1)."""
    @abstractmethod
    async def get_chart_and_interpretation(self, request: AstrologyBirthChartRequest) -> AstrologyResponse:
        pass

class BaseHabitsAdapter(ABC):
    """Abstract contract for Habits tracking and consistency (Teammate 1)."""
    @abstractmethod
    async def get_user_habits_summary(self, user_id: int) -> HabitsSummaryResponse:
        pass

class BaseInsightsAdapter(ABC):
    """Abstract contract for Insights, pattern identification, and growth summaries (Teammate 1)."""
    @abstractmethod
    async def get_user_insights(self, user_id: int) -> InsightsSummaryResponse:
        pass


# =====================================================================
# DEFAULT PLACEHOLDER / STUB IMPLEMENTATIONS FOR TEAMMATE 2
# Used strictly for integration testing until Teammate 1 connects real modules.
# =====================================================================

class PlaceholderAstrologyAdapter(BaseAstrologyAdapter):
    async def get_chart_and_interpretation(self, request: AstrologyBirthChartRequest) -> AstrologyResponse:
        # Stub response demonstrating schema compliance
        return AstrologyResponse(
            status="pending_teammate_1_implementation",
            provider_module="teammate_1_astrology",
            chart_calculated=False,
            sun_sign=None,
            moon_sign=None,
            ascendant=None,
            planetary_positions=[],
            interpretation_summary=(
                "Astrology interpretation contract: This endpoint is ready for Teammate 1's planetary "
                "calculations and interpretation logic. Shared auth, user birth details, language detection, "
                "and safety checks are successfully implemented."
            ),
            evidence_notes="Awaiting Teammate 1 scriptural/astrological citations.",
            disclaimer="Astrological calculations and insights will be provided once Teammate 1 connects their module."
        )

class PlaceholderHabitsAdapter(BaseHabitsAdapter):
    async def get_user_habits_summary(self, user_id: int) -> HabitsSummaryResponse:
        return HabitsSummaryResponse(
            status="pending_teammate_1_implementation",
            provider_module="teammate_1_habits",
            total_active_habits=0,
            habits=[
                HabitContractItem(
                    id=0,
                    title="Teammate 1 Integration Placeholder",
                    frequency="daily",
                    target_days_per_week=7,
                    current_streak=0,
                    is_completed_today=False
                )
            ],
            completion_rate_pct=0.0,
            consistency_score=0.0,
            message="Habits module integration interface established. Awaiting Teammate 1 business logic."
        )

class PlaceholderInsightsAdapter(BaseInsightsAdapter):
    async def get_user_insights(self, user_id: int) -> InsightsSummaryResponse:
        return InsightsSummaryResponse(
            status="pending_teammate_1_implementation",
            provider_module="teammate_1_insights",
            reflection_summary="Growth insights module contract ready for Teammate 1 synthesis engine.",
            key_observations=[
                InsightObservation(
                    category="integration",
                    title="Contract Interface Verified",
                    observation="Adapter contract successfully responds to intent router.",
                    confidence=1.0
                )
            ],
            practical_suggestions=[
                "Teammate 1 can implement concrete habit, astrology, and insight hooks by subclassing BaseInsightsAdapter."
            ],
            message="Insights adapter interface active. Teammate 1 implementation pending."
        )

# Factory singletons (can be swapped at runtime when Teammate 1 plugs their module in)
astrology_adapter: BaseAstrologyAdapter = PlaceholderAstrologyAdapter()
habits_adapter: BaseHabitsAdapter = PlaceholderHabitsAdapter()
insights_adapter: BaseInsightsAdapter = PlaceholderInsightsAdapter()
