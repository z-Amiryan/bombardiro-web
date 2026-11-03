# Guide briefs

Seven guides, written in the Guides milestone. Each one is written for its own market, not translated word
for word.

## Rules for every guide

- **Answer first.** The first 60 words answer the search query directly.
- **Be useful without the app.** Someone who never installs it should still get what they came for.
- **Length:** 700–1,100 words, unless the brief says otherwise. Don't pad.
- **Facts only.** No invented statistics, quotes, reviews or player counts. If you can't support a fact, leave
  it out.
- **Write it yourself.** Don't copy or closely paraphrase another site's text or word list.
- **Mention Bombardiro honestly,** as the game we make. One section and one closing text link, never more.
- **Name no other apps.** Describe game formats instead. Generic games such as Alias, Crocodile and Mafia are fine.
- **Keep it 4+.** No drinking games, gambling, betting or adult content.
- **Links:** to How to play and the Words page in the same language, plus the guides listed in the brief.
- **Voice:** EN is short and direct, second person. RU uses «ты» and imperatives, no gendered past tense,
  «ёлочки», em dashes with spaces and ё. HY uses «դու» imperatives, ։ and ՝, and the question mark on the
  stressed vowel. Use the terms in `content/copy/`.
- **Claims:** every statement about Bombardiro must match `content/copy/`.

---

## 1. Russian: Alias rules

| Field       | Value                                                                                                                                           |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Route id    | `guideAliasRules` · `/ru/guides/pravila-alias/`                                                                                                 |
| Title       | Правила Алиаса: как играть в Элиас, кратко и понятно                                                                                            |
| Description | Правила игры Алиас (Элиас) коротко: команды, таймер, что нельзя говорить и как считать очки. Плюс как играть на телефоне и футбольный вариант.  |
| Searches    | правила алиас · элиас правила игры кратко · как играть в алиас · как играть в алиас на телефоне · как играть в алиас втроём                     |
| Priority    | The highest. Searches currently land on PDFs and store pages                                                                                    |

**Outline:** Правила коротко · Что понадобится · Как проходит ход · Что нельзя говорить · Как считать очки · Как
играть втроём или вдвоём · Как играть на телефоне · Футбольный вариант.

**Facts to use, from the published board-game rules:**

- Players split into teams, and teams take turns.
- The explaining player changes each round.
- You can't say the word or words with the same root. Synonyms, antonyms and hints are allowed.
- A turn is limited by a timer (an hourglass on the board game).
- Guessed words earn points or moves. Mistakes and skips can cost points.
- First team to the finish wins.
- Details differ between editions, so say so.

**Bombardiro's differences:** no penalties, a missed word is simply left unmarked, a target of 51 to 201 points,
and equal turns before a winner is declared.

**Label as house rules:** any way of playing with two or three people.

---

## 2. Russian: games on one phone

| Field       | Value                                                                                                                                         |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Route id    | `guideOnePhone` · `/ru/guides/igry-dlya-kompanii-na-odnom-telefone/`                                                                          |
| Title       | Игры для компании на одном телефоне: 7 идей без интернета                                                                                     |
| Description | Во что играть компанией, если есть один телефон и нет интернета: объяснялки, ролевые игры и футбольный вариант. Сколько нужно людей и как играть. |
| Searches    | игры для компании на телефоне · игры для компании на одном телефоне · игры для компании без интернета · игра объясни слово на телефоне        |

**Seven formats:** Алиас, Шляпа, Крокодил, Мафия, Шпион, «Кто я?» and Bombardiro as the football option.

**For each one:** the idea in two lines, how many people, what the phone does, and how long a round takes. Say
plainly that we make Bombardiro. Don't name other apps.

---

## 3. Russian: football terms glossary

| Field       | Value                                                                                                                                         |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Route id    | `guideGlossary` · `/ru/guides/futbolnye-terminy/`                                                                                             |
| Title       | Футбольные термины и их значение: словарь на трёх языках                                                                                      |
| Description | Главные футбольные термины простыми словами, а ещё на английском и армянском: офсайд, пенальти, хет-трик, ВАР и другие.                       |
| Searches    | футбольные термины и их значение · футбольные термины на английском · основные футбольные термины · футбольные термины список                 |
| Length      | 60–80 terms. This is the one guide that can run longer                                                                                        |

The site's most distinctive asset, because no competitor has this data.

- Take general terms from the `tactics` deck in `content/words/`. Leave out managers and tournament names.
- Each entry: the Russian term, the English and Armenian terms from the packs (same index), and a one-sentence
  definition written by you.
- Group by theme: правила, позиции, тактика, эпизоды.
- Give each term an anchor. Use real table or definition-list markup.

---

## 4. English: Alias rules

| Field       | Value                                                                                                                                          |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Route id    | `guideAliasRules` · `/guides/how-to-play-alias/`                                                                                               |
| Title       | How to play Alias: rules of the word-guessing game                                                                                             |
| Description | Alias rules in plain English: teams, the timer, what you can't say and how to score, plus how to play on a phone and a version for football fans. |
| Searches    | how to play alias · alias game rules · alias board game rules · how to play alias with 3 people                                                |

Same facts and outline as guide 1, written for English readers. Mention that many people know a similar game
by another name only if you can do so without naming a trademark. Otherwise leave it out.

---

## 5. English: one-phone party games

| Field       | Value                                                                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Route id    | `guideOnePhone` · `/guides/one-phone-party-games/`                                                                                          |
| Title       | One-phone party games: 7 games to pass around the room                                                                                      |
| Description | Party games that only need one phone: what each one is, how many people you need and how it works with no wifi. Pass it around and play.   |
| Searches    | one phone party games · pass and play party games · offline party games · one phone group games                                             |

**Seven formats:** describe-the-word (Alias), the hat game (Fishbowl), charades, an imposter game, a
draw-and-pass game, would-you-rather and Bombardiro as the football option. Same per-game details as guide 2.

---

## 6. English: football party games

| Field       | Value                                                                                                                                              |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route id    | `guideFootballParty` · `/guides/football-party-games/`                                                                                             |
| Title       | Football party games for adults: 6 ideas for match day                                                                                             |
| Description | Football (soccer) party games for a watch party or a night in, from describing players against the clock to match bingo. No pitch or kit needed.  |
| Searches    | football party games for adults · football watch party games · soccer party games for adults · football games to play with friends                |

**Six ideas:** describe the player (Bombardiro), match bingo, predict the line-up for fun, guess the player from
their career path, football charades, a half-time quiz.

Say "football (soccer)" early, because in the US "football" means the NFL. No predictions for money, and no
drinking rules.

---

## 7. Armenian: Alias rules

| Field       | Value                                                                                                                                    |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Route id    | `guideAliasRules` · `/hy/guides/alias-kanonner/`                                                                                         |
| Title       | Ալիասի կանոնները՝ ինչպես խաղալ                                                                                                           |
| Description | Ալիասի կանոնները պարզ բառերով՝ թիմեր, ժամանակ, ինչ չի կարելի ասել և ինչպես հաշվել միավորները։ Նաև ինչպես խաղալ հեռախոսով։               |
| Searches    | ալիաս կանոններ · ալիաս խաղ · ալիաս հայերեն                                                                                               |
| Length      | 500–800 words                                                                                                                            |

Same facts as guide 1. Use short, simple sentences and the terms in `content/copy/hy.json`. Armenian is the
language most likely to need correction, so don't try anything clever.
