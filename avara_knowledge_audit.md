# AVARA Knowledge Base Audit
### Source: `avara_knowledge.txt` (351 lines, ~33 KB)

---

## Scope Check — Three Target Domains

### 1. Exalted / Debilitated Planetary States

| State | What the KB Contains | Verdict |
|---|---|---|
| **Exaltation (Uchcha)** | ❌ Zero entries. Not a single planet's exaltation sign is named or interpreted. | **Missing** |
| **Debilitation (Neecha)** | ⚠️ Two partial mentions only: Mercury in 12H labelled "neecha" (debilitated), Sun in 7H called "weakened / debilitated". Neither is the *correct* classical neecha sign. Mercury is debilitated in Pisces (not 12H); Sun is debilitated in Libra (not 7H). The KB conflates **house weakness** with **sign debilitation** — these are completely different concepts. | **Incorrect & Incomplete** |
| **Neecha Bhanga Raj Yoga** | ❌ Not mentioned. This is the single most important cancellation of debilitation. | **Missing** |
| **Planetary Combustion (Asta)** | ❌ Not mentioned. A planet within ~6–8° of the Sun is combust and loses most of its power regardless of house or sign. | **Missing** |
| **Exaltation degree / deepest point** | ❌ Not mentioned (e.g., Sun exalted at 10° Aries, fully debilitated at 10° Libra). | **Missing** |

**Summary:** The KB cannot correctly identify or interpret exaltation or debilitation. It will misclassify planets routinely.

---

### 2. Nakshatra-Based Career Indicators

| Concept | What the KB Contains | Verdict |
|---|---|---|
| **Nakshatra names** | ❌ Not a single Nakshatra is named. | **Missing** |
| **Nakshatra lords (ruling planets)** | ❌ Absent entirely. | **Missing** |
| **Nakshatra career archetypes** | ❌ Absent (e.g., Rohini → arts/agriculture, Hasta → healing/craftsmanship, Jyeshtha → authority/management). | **Missing** |
| **Pada (quarter) subdivisions** | ❌ Absent. | **Missing** |
| **Janma Nakshatra (birth star)** | ⚠️ The phrase "Janma Nakshatra" appears **once** (line 68) as a suggestion chip label in the UI, never defined. | **Cosmetic Only** |
| **Nakshatra-based Dasha triggers** | ❌ Absent (Vimshottari Dasha is initiated by the Moon's Nakshatra at birth). | **Missing** |

**Summary:** The KB contains zero Nakshatra data. Any career advice attributed to "Nakshatra" would be invented by the model.

---

### 3. Basic Planetary Aspects

| Concept | What the KB Contains | Verdict |
|---|---|---|
| **Standard 7th-house mutual aspect** | ⚠️ Implied in one place: "if Jupiter or Saturn aspects the 7th House" (line 311) without defining *how* aspects work. | **Assumed, Not Defined** |
| **Mars special aspects (4th & 8th)** | ❌ Not defined. Mars aspects the 4th and 8th from itself in addition to the 7th — a critical malefic influence on those houses. | **Missing** |
| **Jupiter special aspects (5th & 9th)** | ❌ Not defined. Jupiter's protective 5th/9th aspects are the most significant benefic influence in a chart. | **Missing** |
| **Saturn special aspects (3rd & 10th)** | ❌ Not defined. Saturn's slow disciplining aspects on the 3rd and 10th houses change entire career trajectories. | **Missing** |
| **Rahu/Ketu aspects** | ❌ Not defined. | **Missing** |
| **Aspect strength (full vs. ¾ vs. ½ vs. ¼)** | ❌ Not defined. Western-style equal aspects do not exist in Jyotisha. | **Missing** |
| **Mutual aspect (Parivartana vs. Drishti)** | ❌ Not defined. | **Missing** |

**Summary:** The KB treats aspects as a vague word. It cannot distinguish Jupiter's protective 5th-aspect from a full malefic conjunction.

---

## Critical Interpretive Blind Spots

These are the gaps that would cause a traditional Vedic astrologer to call the advice **wrong**, not just incomplete.

### 🔴 Severity 1 — Will Produce Incorrect Readings

| Blind Spot | Why It Causes Wrong Advice |
|---|---|
| **No Sign placements for any planet** | The entire KB is house-based. A planet in 7H behaves differently in Aries vs. Pisces. Without signs, interpretations are generic at best, wrong at worst. |
| **Exaltation/Debilitation conflated with house position** | Calling Sun in 7H "debilitated" and Mercury in 12H "neecha" is factually incorrect and will confuse users who cross-check. Sun is debilitated in Libra (sign); Mercury in Pisces (sign). These may or may not overlap with 7H/12H for any given Lagna. |
| **No Lagna-specific sign assignments** | The 7H lord, the sign on the 7H cusp, and which planet rules it all change with each Lagna. The KB treats all Lagnas identically for planetary placements, which is invalid. |
| **No Vimshottari Dasha system** | Timing is everything in Jyotisha. Without Dasha periods (Maha Dasha → Antar Dasha), the AI cannot say *when* a placement's results manifest. All advice will be atemporal. |
| **No Nakshatra data** | TeluguKundaliCalculator already computes Nakshatra and Pada. If the AI ignores them, it discards the richest single layer of Jyotisha interpretation. |

### 🟠 Severity 2 — Will Produce Systematically Incomplete Readings

| Blind Spot | What Gets Missed |
|---|---|
| **No Rasi chart sign-to-house mapping per Lagna** | Which houses are Kendra (1,4,7,10), Trikona (1,5,9), Dusthana (6,8,12), Upachaya (3,6,10,11) depends on sign ownership and Lagna — never stated. |
| **No planetary natural benefic/malefic status defined** | Jupiter, Venus, Moon (waxing) = natural benefics. Sun, Mars, Saturn, Rahu, Ketu = natural malefics. Only implied, never stated as a rule the model can apply. |
| **No Yoga catalogue beyond 5 yogas** | The KB mentions Raj Yoga, Dhan Yoga, Vipreet Raj Yoga, Karma-Dharma Raj Yoga, Laxmi Raj Yoga, Neecha Bhanga (absent). Missing: Gajakesari, Budha-Aditya, Kesari, Pancha Mahapurusha yogas, etc. |
| **No house-to-house relationship rules (Bhavat Bhavam)** | The 7H of the 7H is the 1H (self); the 5H of the 9H is the 1H. This recursive house logic underlies all advanced interpretation. |
| **No combustion rules** | A planet within orb of the Sun is combust and functionally weakened, regardless of house strength. A combust Jupiter gives zero benefic aspect protection. |
| **No retrograde (Vakri) interpretation beyond mention** | Retrograde planets are mentioned with an overline abbreviation in chart cells but never interpreted. Retrograde strengthens some planets (Jupiter, Saturn) and creates re-do / internalization effects. |
| **No Ashtakavarga system** | Point-based house-strength scoring (Ashtakavarga) is how traditional astrologers quantify transit effects. Absent entirely. |
| **Coverage limited to 7H & 12H for individual planets** | Houses 1–6 and 8–11 have **zero** individual planet interpretations. Only house-lord placements partially cover those houses. |

### 🟡 Severity 3 — Will Produce Shallow Readings

| Blind Spot | Impact |
|---|---|
| **No remedial measure logic (Upayas)** | Gemstones, mantras, fasting days, charity linked to specific planets are standard Jyotisha output. KB has 3–4 ad hoc remedies but no systematic structure. |
| **No transit (Gochara) rules** | Current planetary positions over natal chart produce real-time predictions. Absent. |
| **No Divisional chart (Varga) references** | D-9 (Navamsa for marriage), D-10 (Dashamsa for career), D-4 (Chaturthamsa for property) are consulted for every serious reading. |
| **No Shadbala (six-fold planetary strength) reference** | Uccha Bala (sign-based strength), Sthana Bala, Kala Bala, etc. determine effective planetary power. |
| **No Muhurtha (auspicious timing) framework** | Not critical for a natal chart app but expected in a full Jyotisha system. |

---

## Exactly What to Add — Priority-Ordered

### Priority 1 (Blocks correct basic interpretation)

```
1. The 9 planets × exaltation sign & exact degree
   e.g., Sun: exalted Aries 10°, debilitated Libra 10°

2. The 9 planets × debilitation sign & exact degree

3. Neecha Bhanga Raj Yoga — 6 classical cancellation conditions
   (debilitated planet's dispositor in Kendra, etc.)

4. Planetary combustion — definition, orbs per planet, effect on aspects

5. Vimshottari Dasha sequence:
   Ketu(7) → Venus(20) → Sun(6) → Moon(10) → Mars(7) → Rahu(18)
   → Jupiter(16) → Saturn(19) → Mercury(17) = 120 years
   — how to calculate start from Moon's Nakshatra at birth

6. All 27 Nakshatras with:
   - Ruling planet
   - Deity
   - Core keywords (3–5 per Nakshatra)
   - Career archetypes
   - Pada (quarter) breakdown

7. Special planetary aspects:
   Mars → 4th & 8th from itself (full aspect)
   Jupiter → 5th & 9th from itself (full aspect)
   Saturn → 3rd & 10th from itself (full aspect)
   Rahu/Ketu → 5th & 9th (debated; include as conditional)

8. Lagna-specific sign ownership table:
   For each of 12 Lagnas, which sign falls on which house,
   which planet owns each house
```

### Priority 2 (Enables accurate relationship/timing advice)

```
9.  Pancha Mahapurusha Yogas (Ruchaka, Bhadra, Hamsa, Malavya, Shasha)
    — condition: planet in own/exaltation sign in a Kendra

10. Gajakesari Yoga (Jupiter in Kendra from Moon)

11. Retrograde planet interpretation per planet

12. Natural benefic vs. malefic classification with
    functional benefic/malefic rules per Lagna

13. Individual planet placements in Houses 1–6 & 8–11
    (the KB currently covers only 7H and 12H)

14. Ashtakavarga — at minimum, Sarvashtakavarga scoring
    for the 12 houses (enables transit strength assessment)
```

### Priority 3 (Depth and remedial completeness)

```
15. Divisional charts: Navamsa (D-9) basics for marriage,
    Dashamsa (D-10) basics for career

16. Gemstone assignment per planet with conditions
    (not all debilitated planets should be strengthened)

17. Mantra/fasting day assignments per planet

18. Gochara (transit) rules for Saturn, Jupiter, Rahu/Ketu
    over natal Moon sign (the most commonly asked questions)

19. Sade Sati — 7.5-year Saturn cycle over Moon sign,
    phases and their effects (already referenced in KB line 86
    but never defined)
```

---

## Bottom Line for Your Team

> The current KB is a **YouTube-transcript summary of house-lord placements and 7H/12H planet readings** — useful for a specific pattern of questions but insufficient for a general Jyotisha AI.
>
> It **cannot**:
> - Correctly identify exalted or debilitated planets (it has the concept wrong)
> - Say anything about Nakshatras despite the calculator computing them
> - Apply planetary aspects correctly (it uses the word but not the mechanics)
> - Tell the user *when* something will happen (no Dasha data)
>
> Adding **Priority 1 items** alone would fix the three domains you asked about and eliminate the most embarrassing factual errors. Estimate: ~400–600 lines of structured text covering the tables and rules above.
