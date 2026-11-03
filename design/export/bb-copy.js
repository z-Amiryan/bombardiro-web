// Copy for the direction mocks. Approved strings come from content/copy/{en,ru,hy}.json.
// Strings marked NEW are not in the copy deck and need sign-off.
(function () {
  var ruPlural = function (n, one, few, many) {
    var a = n % 10, b = n % 100;
    if (a === 1 && b !== 11) return one;
    if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return few;
    return many;
  };
  window.BB_COPY = {
    en: {
      code: 'en', fd: "'Archivo', sans-serif", fds: 'italic', fu: "'Space Grotesk', sans-serif", k: 1, kc: 1,
      nav: { how: 'How to play', words: 'Words', guides: 'Guides', support: 'Support', about: 'About' },
      eyebrow: 'The football Alias',
      h1a: 'Describe it.', h1b: "Don't say it.", h1c: 'Score.',
      lead: 'Bombardiro is a party word game for football fans. One player describes, the team guesses, and every word they get before the whistle is a goal.',
      avail: 'Free on iPhone and iPad', scan: 'Scan with your iPhone camera to get the app',
      getApp: 'Get the app', textLink: 'Available on the App Store',
      badge: 'assets/app-store-en.svg', badgeAlt: 'Download on the App Store',
      turnTitle: 'How a turn works', turnCta: 'Full rules',
      st: {
        a: { t: 'The clock starts', x: '30, 60, 90 or 120 seconds. You set it.' },
        b: { t: "Describe, don't say", x: 'A card shows 5 to 8 football words. Describe each one without saying it.' },
        c: { t: 'Every guess is a goal', x: 'Tap each word your team gets. Clear the card and a fresh one drops on the same clock.' },
        d: { t: 'The whistle ends it', x: 'Only the timer ends a turn. Pass the phone to the next team.' }
      },
      finalTitle: 'Crown the champions', finalText: 'Grab your friends, pick your categories and start the match.',
      shots: { settings: 'assets/screens/en-07-settings.jpg', live: 'assets/screens/en-01-live-card.jpg', late: 'assets/screens/en-02-live-late.jpg', score: 'assets/screens/en-05-scoreboard.jpg' },
      alts: { // NEW
        settings: 'Match settings with a 60-second turn selected',
        live: 'A live card at 00:40 with three words scored',
        late: 'The same card at 00:07: five words scored, the clock in red',
        score: 'The scoreboard after a turn, ready to pass the phone'
      },
      whistleOff: 'Whistle: off', whistleOn: 'Whistle: on', // NEW
      goals: function (n) { return n === 1 ? 'goal' : 'goals'; }, // NEW
      pause: 'Pause', play: 'Play', // NEW
      tapHint: 'Tap a word, score a goal',
      issue: 'No. 01', // NEW
      settingsTitle: 'Your match, your rules',
      settings: [
        { l: 'Number of teams', v: '2 to 4' },
        { l: 'Turn time', v: '30, 60, 90 or 120 seconds' },
        { l: 'Words per card', v: '5 to 8' },
        { l: 'Points to win', v: '51, 101, 151 or 201' },
        { l: 'Difficulty', v: 'Easy or Hard' }
      ],
      tipLabel: 'How to describe',
      cards: [
        { cat: 'Players', w: 'Messi', tip: 'Try the club, the position, the country or a famous moment.' },
        { cat: 'Clubs', w: 'Napoli', tip: 'Try the city, the nickname, the colours or the biggest rival.' },
        { cat: 'Tactics & Trophies', w: 'Offside', tip: "Explain what it means on the pitch, or who's famous for it." }
      ],
      rows: [
        ['MESSI', 'HAALAND', 'MBAPPÉ', 'SALAH', 'BELLINGHAM', 'KANE', 'PEDRI', 'SAKA'],
        ['BARCELONA', 'LIVERPOOL', 'JUVENTUS', 'NAPOLI', 'ARSENAL', 'ROMA', 'CHELSEA', 'REAL MADRID'],
        ['OFFSIDE', 'HAT-TRICK', 'PENALTY', 'OWN GOAL', 'WHISTLE', 'DRIBBLING', 'SLIDE TACKLE', 'CORNER'],
        ['CAMP NOU', 'WEMBLEY', 'ANFIELD', 'OLD TRAFFORD', 'SANTIAGO BERNABEU', 'STAMFORD BRIDGE', 'ETIHAD', 'EMIRATES'],
        ['PELE', 'MARADONA', 'ZIDANE', 'RONALDINHO', 'KAKA', 'BECKHAM', 'GERRARD', 'RONALDO NAZARIO']
      ]
    },
    ru: {
      code: 'ru', fd: "'Noto Sans', sans-serif", fds: 'italic', fu: "'Noto Sans', sans-serif", k: 0.96, kc: 0.94,
      nav: { how: 'Как играть', words: 'Слова', guides: 'Статьи', support: 'Поддержка', about: 'О проекте' },
      eyebrow: 'Футбольный Алиас',
      h1a: 'Объясняй.', h1b: 'Не называй.', h1c: 'Забивай.',
      lead: 'Bombardiro — игра в слова для тех, кто любит футбол. Один игрок объясняет, команда угадывает, а каждое слово до свистка — это гол.',
      avail: 'Бесплатно на iPhone и iPad', scan: 'Наведи камеру iPhone, чтобы скачать игру',
      getApp: 'Скачать игру', textLink: 'Доступно в App Store',
      badge: 'assets/app-store-ru.svg', badgeAlt: 'Загрузите в App Store',
      turnTitle: 'Как проходит ход', turnCta: 'Все правила',
      st: {
        a: { t: 'Запускается таймер', x: '30, 60, 90 или 120 секунд: время выбираешь ты.' },
        b: { t: 'Объясняй, не называй', x: 'На карточке от 5 до 8 футбольных слов. Объясни каждое, не произнося его.' },
        c: { t: 'Угадали — гол!', x: 'Отмечай отгаданные слова касанием. Отгадали всю карточку — сразу появляется новая, а таймер идёт дальше.' },
        d: { t: 'Ход заканчивает свисток', x: 'Завершает ход только таймер. Передай телефон следующей команде.' }
      },
      finalTitle: 'Кто лучший бомбардир?', finalText: 'Собирай друзей, выбирай категории — и начинай матч!',
      shots: { settings: 'assets/screens/ru-07-settings.jpg', live: 'assets/screens/ru-01-live-card.jpg', late: 'assets/screens/ru-02-live-late.jpg', score: 'assets/screens/ru-05-scoreboard.jpg' },
      alts: {
        settings: 'Настройки матча: выбран ход на 60 секунд',
        live: 'Карточка на 00:40: отгаданы три слова',
        late: 'Та же карточка на 00:07: отгадано пять слов, таймер красный',
        score: 'Таблица счёта после хода: телефон передаётся дальше'
      },
      whistleOff: 'Свисток: выкл.', whistleOn: 'Свисток: вкл.',
      goals: function (n) { return ruPlural(n, 'гол', 'гола', 'голов'); },
      pause: 'Пауза', play: 'Пуск',
      tapHint: 'Нажми слово — гол',
      issue: '№ 01',
      settingsTitle: 'Твой матч, твои правила',
      settings: [
        { l: 'Число команд', v: 'от 2 до 4' },
        { l: 'Время хода', v: '30, 60, 90 или 120 секунд' },
        { l: 'Слов на карточке', v: 'от 5 до 8' },
        { l: 'Очков для победы', v: '51, 101, 151 или 201' },
        { l: 'Сложность', v: '«Легко» или «Сложно»' }
      ],
      tipLabel: 'Как объяснять',
      cards: [
        { cat: 'Игроки', w: 'Месси', tip: 'Подскажи клуб, позицию, страну или знаменитый момент.' },
        { cat: 'Клубы', w: 'Наполи', tip: 'Подскажи город, прозвище, цвета или главного соперника.' },
        { cat: 'Тактика и трофеи', w: 'Офсайд', tip: 'Объясни, что это значит на поле или кто этим прославился.' }
      ],
      rows: [
        ['МЕССИ', 'ХОЛАНН', 'МБАППЕ', 'САЛАХ', 'БЕЛЛИНГЕМ', 'КЕЙН', 'ПЕДРИ', 'САКА'],
        ['БАРСЕЛОНА', 'ЛИВЕРПУЛЬ', 'ЮВЕНТУС', 'НАПОЛИ', 'АРСЕНАЛ', 'РОМА', 'ЧЕЛСИ', 'РЕАЛ МАДРИД'],
        ['ОФСАЙД', 'ХЕТ-ТРИК', 'ПЕНАЛЬТИ', 'АВТОГОЛ', 'СВИСТОК', 'ДРИБЛИНГ', 'ПОДКАТ', 'УГЛОВОЙ'],
        ['КАМП НОУ', 'УЭМБЛИ', 'ЭНФИЛД', 'ОЛД ТРАФФОРД', 'САНТЬЯГО БЕРНАБЕУ', 'СТЭМФОРД БРИДЖ', 'ЭТИХАД', 'ЭМИРЕЙТС'],
        ['ПЕЛЕ', 'МАРАДОНА', 'ЗИДАН', 'РОНАЛДИНЬО', 'КАКА', 'БЕКХЭМ', 'ДЖЕРРАРД', 'РОНАЛДО']
      ]
    },
    hy: {
      code: 'hy', fd: "'Noto Sans Armenian', sans-serif", fds: 'normal', fu: "'Noto Sans Armenian', sans-serif", k: 0.8, kc: 0.92,
      nav: { how: 'Ինչպես խաղալ', words: 'Բառեր', guides: 'Հոդվածներ', support: 'Աջակցություն', about: 'Մեր մասին' },
      eyebrow: 'Ֆուտբոլային Ալիաս',
      h1a: 'Նկարագրիր բառը։', h1b: 'Մի անվանիր։', h1c: 'Գոլ խփիր։',
      lead: 'Bombardiro-ն բառախաղ է ֆուտբոլասերների համար։ Մեկ խաղացողը նկարագրում է, թիմը գուշակում է, և սուլիչից առաջ գուշակված յուրաքանչյուր բառ գոլ է։',
      avail: 'Անվճար iPhone-ի և iPad-ի համար', scan: 'Սկանավորիր iPhone-ի տեսախցիկով՝ խաղը ներբեռնելու համար',
      getApp: 'Ներբեռնել խաղը', textLink: 'Հասանելի է App Store-ում',
      badge: 'assets/app-store-en.svg', badgeAlt: 'Download on the App Store',
      turnTitle: 'Ինչպես է անցնում հերթը', turnCta: 'Բոլոր կանոնները',
      st: {
        a: { t: 'Ժամանակը սկսվում է', x: '30, 60, 90 կամ 120 վայրկյան՝ ընտրությունը քոնն է։' },
        b: { t: 'Նկարագրիր, մի ասա', x: 'Քարտի վրա 5-ից 8 ֆուտբոլային բառ կա։ Նկարագրիր յուրաքանչյուրը՝ առանց այն ասելու։' },
        c: { t: 'Գուշակված բառը գոլ է', x: 'Սեղմիր թիմիդ գուշակած յուրաքանչյուր բառը։ Եթե բոլորը գուշակվեն, նույն հերթի ընթացքում կգա նոր քարտ։' },
        d: { t: 'Հերթն ավարտում է սուլիչը', x: 'Հերթն ավարտում է միայն ժամանակը։ Հեռախոսը տուր հաջորդ թիմին։' }
      },
      finalTitle: 'Ո՞վ կդառնա չեմպիոն', finalText: 'Հավաքիր ընկերներիդ, ընտրիր կատեգորիաները և սկսիր խաղը։',
      shots: { settings: 'assets/screens/en-07-settings.jpg', live: 'assets/screens/en-01-live-card.jpg', late: 'assets/screens/en-02-live-late.jpg', score: 'assets/screens/en-05-scoreboard.jpg' },
      alts: {
        settings: 'Խաղի կարգավորումներ՝ ընտրված է 60 վայրկյան',
        live: 'Քարտ՝ 00:40, գուշակված է երեք բառ',
        late: 'Նույն քարտը՝ 00:07, գուշակված է հինգ բառ',
        score: 'Միավորների աղյուսակը հերթից հետո'
      },
      whistleOff: 'Սուլիչ՝ անջատված', whistleOn: 'Սուլիչ՝ միացված',
      goals: function () { return 'գոլ'; },
      pause: 'Դադար', play: 'Շարունակել',
      tapHint: 'Սեղմիր բառը և գրանցիր միավոր',
      issue: '№ 01',
      settingsTitle: 'Քո խաղը, քո կանոնները',
      settings: [
        { l: 'Թիմերի քանակ', v: '2-ից 4' },
        { l: 'Հերթի տևողություն', v: '30, 60, 90 կամ 120 վայրկյան' },
        { l: 'Բառ քարտի վրա', v: '5-ից 8' },
        { l: 'Հաղթանակի միավոր', v: '51, 101, 151 կամ 201' },
        { l: 'Բարդություն', v: '«Հեշտ» կամ «Դժվար»' }
      ],
      tipLabel: 'Ինչպես նկարագրել',
      cards: [
        { cat: 'Խաղացողներ', w: 'Մեսսի', tip: 'Հուշիր ակումբը, դիրքը, երկիրը կամ հայտնի դրվագ։' },
        { cat: 'Ակումբներ', w: 'Նապոլի', tip: 'Հուշիր քաղաքը, մականունը, գույները կամ գլխավոր մրցակցին։' },
        { cat: 'Մարտավարություն և գավաթներ', w: 'Օֆսայդ', tip: 'Բացատրիր, թե դա ինչ է նշանակում խաղադաշտում կամ ով է դրանով հայտնի։' }
      ],
      rows: [
        ['ՄԵՍՍԻ', 'ՀՈԼԱՆԴ', 'ՄԲԱՊՊԵ', 'ՍԱԼԱՀ', 'ԲԵԼԻՆԳԵՄ', 'ՔԵՅՆ', 'ՊԵԴՐԻ', 'ՍԱԿԱ'],
        ['ԲԱՐՍԵԼՈՆԱ', 'ԼԻՎԵՐՊՈՒԼ', 'ՅՈՒՎԵՆՏՈՒՍ', 'ՆԱՊՈԼԻ', 'ԱՐՍԵՆԱԼ', 'ՌՈՄԱ', 'ՉԵԼՍԻ', 'ՌԵԱԼ ՄԱԴՐԻԴ'],
        ['ՕՖՍԱՅԴ', 'ՀԵԹ-ՏՐԻԿ', 'ՊԵՆԱԼՏԻ', 'ԱՎՏՈԳՈԼ', 'ՍՈՒԼԻՉ', 'ԴՐԻԲԼԻՆԳ', 'ՊԱԴԿԱՏ', 'ԱՆԿՅՈՒՆԱՅԻՆ'],
        ['ԿԱՄՊ ՆՈՈՒ', 'ՈՒԵՄԲԼԻ', 'ԷՆՖԻԼԴ', 'ՕԼԴ ՏՐԱՖՈՐԴ', 'ՍԱՆՏԻԱԳՈ ԲԵՌՆԱԲԵՈՒ', 'ՍՏԵՄՖՈՐԴ ԲՐԻՋ', 'ԷԹԻՀԱԴ', 'ԷՄԻՐԵՅԹՍ'],
        ['ՊԵԼԵ', 'ՄԱՐԱԴՈՆԱ', 'ԶԻԴԱՆ', 'ՌՈՆԱԼԴԻՆՅՈ', 'ԿԱԿԱ', 'ԲԵՔՀԵՄ', 'ՋԵՐԱՐԴ', 'ՌՈՆԱԼԴՈ']
      ]
    }
  };
})();
