# Surf King — R0 60-card physical deck and effect reference (trial only)

**Status:** A single **candidate deck for the owner's manual tabletop tests**, based on [B60 proposal](DECK_REBALANCE_PROPOSAL.md). Not ratified, not implemented and **not necessarily balanced**. Use together with [R0 playtest rules](PLAYTEST_R0_RULES.md). Each copy is an individual card; 4 fixed Sharks begin on board and are **not** drawn.

## Print/deal inventory — exactly 60 cards

| Card | Copies | Action in R0 trial |
| --- | ---: | --- |
| Energy | **6** | Restore **1 energy**, up to 5. |
| Energy x2 | **4** | Restore **2 energy**, up to 5. |
| Coconut | **2** | Restore energy **to 5**. |
| Swimming Fin | **5** | **Only at start of own turn while fallen:** stand on that cell at **2 energy**; uses that turn's tactical action. |
| Lifeguard Float | **4** | **Only at start of own turn while fallen:** stand at **3 energy**; uses tactical action. |
| Big Wave | **3** | A standing rival within **2 true edges** loses **2 energy**, unless protected by Amulet. One card transfers on a genuine fall. |
| Sunburn | **4** | A standing rival within **3 true edges** loses **1 energy**, unless protected by Amulet. One card transfers on a genuine fall. |
| Stone | **4** | Place on an empty legal hex within **2 edges**; nobody can enter. Lasts until **start of your third subsequent personal turn**, or until Jumping removes it. **At most one active Stone per player**. |
| Storm | **4** | Place on empty legal hex within **2 edges**; each entrant loses **1 energy**. Persists until Jumping removes it. |
| Island | **3** | Place on empty legal hex within **2 edges**; the **first entrant gains 2 energy** (maximum 5), then Island is removed and its card discarded. |
| Cyclone | **3** | Place on empty legal hex within **2 edges**; on entry move the entrant to **one uniformly random free true-edge neighbor**, excluding the hex they entered from. Resolve new destination terrain once. If none, remain on Cyclone. No further Cyclone redirection in that maneuver. Persists until removed. |
| Change | **2** | Swap your hex with one **standing** rival within **2 edges**, unless protected by Amulet. This **replaces your normal maneuver**. Resolve terrain entered by **both** people once, and any resulting fall on the destination hex. |
| Jumping | **4** | Remove **one adjacent player-placed obstacle** (Stone, Storm, Island, Cyclone), not a fixed Shark. That placed physical card enters the discard pile; then perform the ordinary maneuver. |
| Tsunami | **3** | Choose a **non-start/non-beach row** having a cell within **2 edges** of you. For each **standing opposing surfer on that row**, in ascending starting-cell ID order, the caster chooses one **vacant, legal edge-neighbor in a lower (seaward) row** and pushes them **one step**; if none, they stay. Amulet blocks an affected surfer's forced move. Resolve arrival terrain once. Your normal move follows. |
| Hang Loose | **3** | Put this card face-up as an **active defense**: opponents cannot attempt a normal adjacent Drop In against you until **the start of your next personal turn**. Does not block Big Wave, Sunburn or terrain. |
| Amulet | **2** | Face-up active until **start of next personal turn**: blocks other players' damaging cards, card-forced movement and normal Drop In against you. Does **not** protect against Shark or terrain entered normally. |
| Surf Current | **4** | Spend your tactic and take **up to two consecutive legal ordinary edge moves** instead of one; first step compulsory if any legal move exists, second optional. Resolve both arrivals in order, **stop on fall or beach**, and draw at most once at the end. **Any standing player may use it in R0**, including a leader; leader-only use may be unbalanced. |
| **Total** | **60** | **17 live card types** (no Bottled Water or Energy x3). |

### Universal placement restrictions

For Stone, Storm, Island and Cyclone, the chosen target must be an **unoccupied, obstacle-free non-Shark cell from 7 through 48**, excluding all beach cells. Its shortest edge-graph distance from the caster must be **at most 2**. Preplaced Sharks are permanent. **Only Stone has the pilot one-per-owner limit.** Never place obstacles on occupied cells, including a fallen surfer, and never place a second placed card on an existing obstacle.

If placing or activating a card makes no legal sense, do not spend it. All hand cards are discarded when used unless they are **on the board** (placed obstacles) or face-up **active** (Hang Loose/Amulet); an active or board card is **not eligible** for the random card loss from falling. Remove it to the discard pile when it expires or is cleared.

### Randomness and priority details

- Uniform random lost hand card: shuffle that surfer's eligible unplayed hand face down; remove one without looking; put in discard or give to the responsible attacker. If no eligible hand card, nothing happens.
- A Cyclone chooses uniformly from valid destinations by assigning each one a number and rolling/rerolling a die. Ignore occupied, Stone-blocked or source-return cells. Never teleport to an arbitrary numeric-ID offset.
- On Tsunami, the **card player** selects the legal seaward edge for each affected rival; resolve targets sequentially, in ascending cell ID at the start of the effect. Do not overlap pieces. If no rival can be moved, Tsunami cannot be used.
- Direct damage/Drop In/fall-card transfer is resolved **before** any optional exchange. A fallen surfer continues to occupy the same hex.
- If an obstacle causes a fall through **normal terrain entry**, its effect is treated as terrain (discard one lost hand card), even if an opponent placed it. If an opponent **directly forces** entry by Change/Tsunami, credit the initiator (transfer one random hand card) in R0. This attribution is **trial-only and separately awaiting design approval**.
- **First personal turn**: no Big Wave, Sunburn, Change, Tsunami or Drop In (direct damage/forced opponent movement); preparation and placing obstacles are allowed.

### Why these quantities are still experimental

The previous 64-card source deck included **4 Bottled Water** copies whose old movement-tax effect becomes ineffective at pilot movement cost 0; **2 Energy x3** duplicates high healing. The proposed 60-card distribution reduces plain energy restoration from 18 to 12, enhances defense/mobility and adds Surf Current. Previous model trials suggest Surf Current speeds up play but can favor front-runners, and targeted attacks can make seven-player matches noisy. **Do not take the counts or ranges as owner-approved permanent card design.**

**Track especially:** Cards never played, unreadable/slow placement actions, whether Jumping actually answers Stone, number of people who can target each other, first-turn tactical safety, repeated theft from a single victim, whether defense lasts long enough, how many players get meaningful chances after falling, and who benefits from Surf Current. Report these with actual manual sessions; the assistant's model experiments are archived in the linked rule-review hub.
