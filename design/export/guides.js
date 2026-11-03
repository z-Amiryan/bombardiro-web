// Guide content for the prototype. DRAFT TEXT: written by the designer from handoff/guide-briefs.md,
// not approved copy. Every article needs an editor; RU/HY need a native speaker.
(function () {
  var hub = {
    en: [
      { id: 'aliasRules', kicker: 'Rules', title: 'How to play Alias: rules of the word-guessing game', text: 'Alias rules in plain English: teams, the timer, what you can’t say and how to score, plus how to play on a phone and a version for football fans.', min: 5, built: true },
      { id: 'onePhone', kicker: 'Party games', title: 'One-phone party games: 7 games to pass around the room', text: 'Party games that only need one phone: what each one is, how many people you need and how it works with no wifi.', min: 6 },
      { id: 'footballParty', kicker: 'Match day', title: 'Football party games for adults: 6 ideas for match day', text: 'Football (soccer) party games for a watch party or a night in, from describing players against the clock to match bingo.', min: 5 }
    ],
    ru: [
      { id: 'aliasRules', kicker: 'Правила', title: 'Правила Алиаса: как играть в Элиас, кратко и понятно', text: 'Правила игры Алиас (Элиас) коротко: команды, таймер, что нельзя говорить и как считать очки.', min: 5, built: true },
      { id: 'onePhone', kicker: 'Игры для компании', title: 'Игры для компании на одном телефоне: 7 идей без интернета', text: 'Во что играть компанией, если есть один телефон и нет интернета: объяснялки, ролевые игры и футбольный вариант.', min: 6 },
      { id: 'glossary', kicker: 'Словарь', title: 'Футбольные термины и их значение: словарь на трёх языках', text: 'Главные футбольные термины простыми словами, а ещё на английском и армянском: офсайд, пенальти, хет-трик, ВАР и другие.', min: 9 }
    ],
    hy: [
      { id: 'aliasRules', kicker: 'Կանոններ', title: 'Ալիասի կանոնները՝ ինչպես խաղալ', text: 'Ալիասի կանոնները պարզ բառերով՝ թիմեր, ժամանակ, ինչ չի կարելի ասել և ինչպես հաշվել միավորները։', min: 4, built: true }
    ]
  };

  var article = {
    en: {
      crumb: 'Guides', kicker: 'Rules', updated: 'Updated 2 November 2026', readLabel: '5 min read', tocLabel: 'On this page', shortLabel: 'The short answer',
      title: 'How to play Alias: rules of the word-guessing game',
      short: 'Alias is a team word game. One player describes a word without saying it, their team guesses against a timer, and every correct guess scores. Teams take turns, the describer changes every round, and the first team to the finish wins.',
      sections: [
        { id: 'rules', h: 'The rules in short', list: ['Split into teams of at least two players.', 'Teams take turns. In each turn, one player describes and the rest of the team guesses.', 'The describer can’t say the word or any word with the same root. Synonyms, opposites and hints are allowed.', 'A timer limits the turn. The board game uses an hourglass.', 'Every guessed word scores. In many editions, a skipped word costs a point.', 'The first team to reach the finish wins.'], note: 'Details differ between editions, so agree on them before you start.' },
        { id: 'need', h: 'What you need', p: ['Four or more people, a set of words, a timer and a way to keep score. The board game has cards, an hourglass and a board. A phone can do all four jobs.'] },
        { id: 'turn', h: 'How a turn works', p: ['The describer takes a card and starts the timer. They describe the first word, the team shouts guesses, and the moment someone gets it, the describer moves to the next word. When the time runs out, the turn ends, the team counts its words, and the next team goes.', 'Next round, someone else on the team describes. Over a game, everyone gets a go.'] },
        { id: 'cant', h: 'What you can’t say', list: ['The word itself.', 'Any word with the same root: for “goalkeeper”, you can’t say “goal”.', 'Many groups also ban spelling the word or translating it. That’s a house rule, so agree on it first.'], p: ['Everything else is fair: synonyms, opposites, examples and hints.'] },
        { id: 'score', h: 'How to score', p: ['Each guessed word is a point. Many editions take a point away for every skip, so describers don’t give up too fast. Agree on a target before you start, or play a fixed number of rounds.'] },
        { id: 'three', h: 'Playing with two or three', house: 'House rules', p: ['With three, play as individuals: one describes, the other two race to guess, and whoever guesses first takes the point. Swap the describer every turn.', 'With two, play together against the clock: take turns describing and try to beat your best total.'] },
        { id: 'phone', h: 'Playing on a phone', p: ['A phone replaces the cards, the timer and the scorepad. One phone is enough: the describer holds it, taps each word as the team gets it, then passes it to the next team.'] },
        { id: 'football', h: 'The football version', p: ['We make Bombardiro, a football version of Alias for iPhone and iPad. Every word is football: players, clubs, stadiums, legends, tactics and trophies, and the World Cup. It changes a few of the rules above:'], compare: true }
      ],
      compare: { cols: ['', 'Classic Alias', 'Bombardiro'], rows: [['Missed words', 'Often cost a point', 'Simply left unmarked'], ['Winning', 'First to the finish', '51, 101, 151 or 201 points'], ['Turns', 'The game can end mid-round', 'The round is played out so everyone gets equal turns'], ['Words', 'Every topic', 'Football only, Easy or Hard']] },
      endLink: 'How to play Bombardiro',
      related: 'More guides'
    },
    ru: {
      crumb: 'Статьи', kicker: 'Правила', updated: 'Обновлено 2 ноября 2026', readLabel: '5 минут', tocLabel: 'В статье', shortLabel: 'Коротко',
      title: 'Правила Алиаса: как играть в Элиас, кратко и понятно',
      short: 'Алиас (Элиас) — командная игра в слова. Один игрок объясняет слово, не называя его, команда угадывает на время, а каждое угаданное слово приносит очко. Команды ходят по очереди, объясняющий меняется каждый раунд, а побеждает та команда, что первой дойдёт до финиша.',
      sections: [
        { id: 'rules', h: 'Правила коротко', list: ['Разделитесь на команды минимум по два человека.', 'Команды ходят по очереди. В каждом ходе один игрок объясняет, остальные угадывают.', 'Нельзя называть само слово и однокоренные слова. Синонимы, антонимы и подсказки — можно.', 'Ход ограничен таймером. В настольной игре это песочные часы.', 'Каждое угаданное слово — очко. Во многих изданиях за пропуск снимают очко.', 'Побеждает команда, которая первой дойдёт до финиша.'], note: 'Правила в разных изданиях отличаются, поэтому договоритесь о деталях до начала игры.' },
        { id: 'need', h: 'Что понадобится', p: ['Четыре человека или больше, набор слов, таймер и способ считать очки. В настольной игре есть карточки, песочные часы и поле. Телефон справится со всем сразу.'] },
        { id: 'turn', h: 'Как проходит ход', p: ['Объясняющий берёт карточку и запускает таймер. Он объясняет первое слово, команда выкрикивает варианты, и как только кто-то угадал — переходит к следующему. Время вышло — ход закончен, команда считает слова, ходит следующая.', 'В следующем раунде объясняет другой игрок команды. За игру каждый успеет побыть объясняющим.'] },
        { id: 'cant', h: 'Что нельзя говорить', list: ['Само слово.', 'Однокоренные слова: для «вратаря» нельзя говорить «ворота».', 'Многие компании запрещают ещё и называть слово по буквам или переводить его. Это домашнее правило — договоритесь заранее.'], p: ['Всё остальное можно: синонимы, антонимы, примеры и подсказки.'] },
        { id: 'score', h: 'Как считать очки', p: ['Каждое угаданное слово — очко. Во многих изданиях за каждый пропуск снимают очко, чтобы объясняющий не сдавался слишком быстро. Договоритесь о цели до начала или сыграйте заранее заданное число раундов.'] },
        { id: 'three', h: 'Как играть втроём или вдвоём', house: 'Домашние правила', p: ['Втроём играйте каждый за себя: один объясняет, двое соревнуются, кто угадает первым, и забирают очко. Объясняющий меняется каждый ход.', 'Вдвоём играйте вместе против таймера: объясняйте по очереди и старайтесь побить свой рекорд.'] },
        { id: 'phone', h: 'Как играть на телефоне', p: ['Телефон заменяет карточки, таймер и блокнот для счёта. Хватит одного: объясняющий держит его, отмечает касанием каждое угаданное слово и передаёт телефон следующей команде.'] },
        { id: 'football', h: 'Футбольный вариант', p: ['Мы делаем Bombardiro — футбольный Алиас для iPhone и iPad. Все слова — про футбол: игроки, клубы, стадионы, легенды, тактика и трофеи, чемпионаты мира. Пара правил отличается:'], compare: true }
      ],
      compare: { cols: ['', 'Классический Алиас', 'Bombardiro'], rows: [['Пропущенные слова', 'Часто минус очко', 'Просто остаются неотмеченными'], ['Победа', 'Кто первым дошёл до финиша', '51, 101, 151 или 201 очко'], ['Ходы', 'Игра может закончиться посреди круга', 'Круг доигрывается, у всех поровну ходов'], ['Слова', 'На любые темы', 'Только футбол, «Легко» или «Сложно»']] },
      endLink: 'Как играть в Bombardiro',
      related: 'Ещё статьи'
    },
    hy: {
      crumb: 'Հոդվածներ', kicker: 'Կանոններ', updated: 'Թարմացվել է 2026 թ. նոյեմբերի 2-ին', readLabel: '4 րոպե', tocLabel: 'Հոդվածում', shortLabel: 'Կարճ ասած',
      title: 'Ալիասի կանոնները՝ ինչպես խաղալ',
      short: 'Ալիասը թիմային բառախաղ է։ Մեկ խաղացողը նկարագրում է բառը՝ առանց այն ասելու, թիմը գուշակում է ժամանակի դեմ, և յուրաքանչյուր գուշակված բառ միավոր է։ Թիմերը խաղում են հերթով, իսկ հաղթում է այն թիմը, որն առաջինը կհասնի ավարտին։',
      sections: [
        { id: 'rules', h: 'Կանոնները կարճ', list: ['Բաժանվեք թիմերի՝ առնվազն երկու հոգով։', 'Թիմերը խաղում են հերթով։ Մեկը նկարագրում է, մյուսները գուշակում են։', 'Չի կարելի ասել բառը կամ նույն արմատով բառեր։ Հոմանիշներն ու հուշումները թույլատրված են։', 'Հերթը սահմանափակված է ժամանակով։', 'Յուրաքանչյուր գուշակված բառ միավոր է։', 'Հաղթում է այն թիմը, որն առաջինը կհասնի ավարտին։'], note: 'Տարբեր տարբերակներում կանոնները տարբեր են, ուստի պայմանավորվեք նախապես։' },
        { id: 'need', h: 'Ինչ է պետք', p: ['Չորս կամ ավելի մարդ, բառեր, ժամանակաչափ և միավորները հաշվելու միջոց։ Հեռախոսը կարող է անել այս ամենը։'] },
        { id: 'turn', h: 'Ինչպես է անցնում հերթը', p: ['Նկարագրողը միացնում է ժամանակաչափը և նկարագրում է առաջին բառը։ Երբ թիմը գուշակում է, նա անցնում է հաջորդին։ Ժամանակն ավարտվում է, և հերթը անցնում է հաջորդ թիմին։'] },
        { id: 'cant', h: 'Ինչ չի կարելի ասել', list: ['Բառը։', 'Նույն արմատով բառեր։'], p: ['Մնացած ամեն ինչ թույլատրված է՝ հոմանիշներ, հականիշներ, օրինակներ և հուշումներ։'] },
        { id: 'phone', h: 'Ինչպես խաղալ հեռախոսով', p: ['Հեռախոսը փոխարինում է քարտերին, ժամանակաչափին և հաշվին։ Մեկ հեռախոսը բավական է՝ սեղմիր գուշակված բառը և հեռախոսը տուր հաջորդ թիմին։'] },
        { id: 'football', h: 'Ֆուտբոլային տարբերակ', p: ['Մենք ստեղծում ենք Bombardiro-ն՝ ֆուտբոլային Ալիաս iPhone-ի և iPad-ի համար։ Բոլոր բառերը ֆուտբոլի մասին են։'], compare: true }
      ],
      compare: { cols: ['', 'Դասական Ալիաս', 'Bombardiro'], rows: [['Բաց թողած բառեր', 'Հաճախ մինուս միավոր', 'Պարզապես չեն նշվում'], ['Հաղթանակ', 'Առաջինը ավարտին', '51, 101, 151 կամ 201 միավոր'], ['Հերթեր', 'Խաղը կարող է ավարտվել շրջանի մեջտեղում', 'Շրջանը խաղարկվում է մինչև վերջ'], ['Բառեր', 'Ցանկացած թեմա', 'Միայն ֆուտբոլ']] },
      endLink: 'Ինչպես խաղալ Bombardiro',
      related: 'Այլ հոդվածներ'
    }
  };
  window.BB_GUIDES = { hub: hub, article: article };
})();
