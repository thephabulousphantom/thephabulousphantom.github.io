var kB = {
};

kB.SmartDie = {
};

kB.SmartDie.QuestionLibraries = [];
kB.SmartDie.Cards = [];

kB.SmartDie.App = (function () {

    var rasterize = function rasterize(dataUrl, canvas, width, height) {

        var originalImage = new Image();
        originalImage.onload = function onOriginalImageLoaded() {

            canvas.width = width;
            canvas.height = height;

            var context = canvas.getContext("2d");
            context.drawImage(originalImage, 0, 0, width, height);
        }

        originalImage.src = dataUrl;
    }

    var modes = {

        waiting: 0,
        showingQuestion: 1,
        counting: 2,
        showingAnswer: 3,
        showingPoints: 4,
        drawCard: 5,
        cardDrawn: 6
    };

    var speeds = [
        { name: "Спора брзина", milliseconds: 1600 },
        { name: "Нормална брзина", milliseconds: 800 },
        { name: "Брза брзина", milliseconds: 400 }
    ];

    var _currentSpeed = 1;
    var _currentLibrary = 0;
    var _questions = [];
    var instance = this;
    var _mainContainer = null;
    var _speedElement = null;
    var _libraryElement = null;
    var _startElement = null;
    var _questionElement = null;
    var _hardnessElement = null;
    var _answer1Element = null;
    var _answer2Element = null;
    var _answer3Element = null;
    var _answer4Element = null;
    var _pointsElement = null;
    var _answerImageElement = null;
    var _drawCardElement = null;
    var _cardImage = null;
    var _cardBackImage = null;
    var _correctAnswerElement = null;
    var _mode = modes.waiting;
    var _modeStartTime = new Date();
    var _maxPoints = 6;
    var _actualMaxPoints = 6;
    var _pointTimeout = 0;
    var _points = 0;
    var _graceTimeMilliseconds = 1250;
    var _lastCardBackRasterizedSize = 0;

    function clearQuestions() {

        _questions.length = 0;
    }

    function loadQuestions(questions) {

        for (var i = 0; i < questions.length; i++) {

            _questions.push(questions[i]);
        }
    }

    function onSpeedClicked(e) {

        _currentSpeed = (++_currentSpeed) % speeds.length;
        _speedElement.innerHTML = getLabel(speeds[_currentSpeed].name);

        e.preventDefault();
        return false;
    }

    function onLibraryClicked(e) {

        _currentLibrary = (++_currentLibrary) % kB.SmartDie.QuestionLibraries.length;
        _libraryElement.innerHTML = getLabel(kB.SmartDie.QuestionLibraries[_currentLibrary].name);

        e.preventDefault();
        return false;
    }

    function onStartClicked(e) {

        changeMode(modes.showingQuestion);

        e.preventDefault();
        return false;
    }

    function onDrawCardClicked(e) {

        changeMode(modes.drawCard);

        e.preventDefault();
        return false;
    }

    function onCardClicked(e) {

        changeMode(modes.waiting);

        e.preventDefault();
        return false;
    }

    function onAnswer1Clicked(e) {

        if (_answer1Element.correct != "1") {

            _points = 0;
        }

        changeMode(modes.showingAnswer);

        e.preventDefault();
        return false;
    }

    function onAnswer2Clicked(e) {

        if (_answer2Element.correct != "1") {

            _points = 0;
        }

        changeMode(modes.showingAnswer);

        e.preventDefault();
        return false;
    }

    function onAnswer3Clicked(e) {

        if (_answer3Element.correct != "1") {

            _points = 0;
        }

        changeMode(modes.showingAnswer);

        e.preventDefault();
        return false;
    }

    function onAnswer4Clicked(e) {

        if (_answer4Element.correct != "1") {

            _points = 0;
        }

        changeMode(modes.showingAnswer);

        e.preventDefault();
        return false;
    }

    function onPointsClicked(e) {

        changeMode(modes.waiting);

        e.preventDefault();
        return false;
    }

    function getLabel(text) {

        return "<div><span>" + text + "</span></div>";
    }

    function initUi() {

        _versionElement = document.createElement("div");
        _versionElement.className = "versionElement labelContainer";
        _versionElement.innerHTML = getLabel(kB.SmartDie.Version);

        _speedElement = document.createElement("div");
        _speedElement.className = "speedElement labelContainer";
        _speedElement.ontouchstart = onSpeedClicked;
        _speedElement.onmousedown = onSpeedClicked;

        _libraryElement = document.createElement("div");
        _libraryElement.className = "libraryElement labelContainer";
        _libraryElement.ontouchstart = onLibraryClicked;
        _libraryElement.onmousedown = onLibraryClicked;

        _startElement = document.createElement("div");
        _startElement.className = "startElement labelContainer";
        _startElement.innerHTML = getLabel("Крени");
        _startElement.ontouchstart = onStartClicked;
        _startElement.onmousedown = onStartClicked;

        _questionElement = document.createElement("div");
        _questionElement.className = "questionElement labelContainer";

        _hardnessElement = document.createElement("div");
        _hardnessElement.className = "hardnessElement labelContainer";

        _answer1Element = document.createElement("div");
        _answer1Element.className = "answerElement labelContainer";
        _answer1Element.ontouchstart = onAnswer1Clicked;
        _answer1Element.onmousedown = onAnswer1Clicked;

        _answer2Element = document.createElement("div");
        _answer2Element.className = "answerElement labelContainer";
        _answer2Element.ontouchstart = onAnswer2Clicked;
        _answer2Element.onmousedown = onAnswer2Clicked;

        _answer3Element = document.createElement("div");
        _answer3Element.className = "answerElement labelContainer";
        _answer3Element.ontouchstart = onAnswer3Clicked;
        _answer3Element.onmousedown = onAnswer3Clicked;

        _answer4Element = document.createElement("div");
        _answer4Element.className = "answerElement labelContainer";
        _answer4Element.ontouchstart = onAnswer4Clicked;
        _answer4Element.onmousedown = onAnswer4Clicked;

        _pointsElement = document.createElement("div");
        _pointsElement.className = "pointsElement labelContainer";
        _pointsElement.ontouchstart = onPointsClicked;
        _pointsElement.onmousedown = onPointsClicked;

        _correctAnswerElement = document.createElement("div");
        _correctAnswerElement.className = "correctAnswer labelContainer";

        _answerImageElement = document.createElement("img");
        _answerImageElement.className = "answerImage";

        _drawCardElement = document.createElement("div");
        _drawCardElement.className = "drawCardElement labelContainer";
        _drawCardElement.innerHTML = getLabel("Вуци картицу");
        _drawCardElement.ontouchstart = onDrawCardClicked;
        _drawCardElement.onmousedown = onDrawCardClicked;

        _cardBackImage = document.createElement("canvas");
        _cardBackImage.className = "cardBackImage";

        _cardImage = document.createElement("canvas");
        _cardImage.className = "cardImage";
        _cardImage.ontouchstart = onCardClicked;
        _cardImage.onmousedown = onCardClicked;

        _mainContainer = document.body;

        _mainContainer.appendChild(_speedElement);
        _mainContainer.appendChild(_libraryElement);
        _mainContainer.appendChild(_startElement);
        _mainContainer.appendChild(_questionElement);
        _mainContainer.appendChild(_hardnessElement);
        _mainContainer.appendChild(_answer1Element);
        _mainContainer.appendChild(_answer2Element);
        _mainContainer.appendChild(_answer3Element);
        _mainContainer.appendChild(_answer4Element);
        _mainContainer.appendChild(_correctAnswerElement);
        _mainContainer.appendChild(_pointsElement);
        _mainContainer.appendChild(_answerImageElement);
        _mainContainer.appendChild(_versionElement);
        _mainContainer.appendChild(_drawCardElement);
        _mainContainer.appendChild(_cardImage);
        _mainContainer.appendChild(_cardBackImage);
    }

    function updateSize() {

        var screenWidth = window.innerWidth;
        var screenHeight = window.innerHeight;

        var scale = (screenWidth > screenHeight ? screenWidth : screenHeight) / 160;
        var margin = 6 * scale;
        var rowHeight = (screenHeight - (5 * margin)) / 4;
        var columnWidth = (screenWidth - (3 * margin)) / 2;
        var rounding = 6 * scale;
        var border = 1 * scale;
        var fontSize = 8 * scale;
        var buttonShadow = "inset 0px " + (-rounding) + "px " + (rounding / 2) + "px 0px #dddaee";

        if (fontSize > rowHeight - 3 * scale) {

            fontSize = rowHeight - 3 * scale;
        }

        _versionElement.style.left = margin;
        _versionElement.style.width = screenWidth - 2 * margin;
        _versionElement.style.top = screenHeight - margin;
        _versionElement.style.height = margin;
        _versionElement.style.fontSize = 0.5 * margin + "px";
        _versionElement.style.border = "none";

        _speedElement.style.left = 2 * margin - border;
        _speedElement.style.width = screenWidth - (4 * margin);
        _speedElement.style.top = margin - border;
        _speedElement.style.height = rowHeight;
        _speedElement.style.fontSize = 0.75 * fontSize + "px";
        _speedElement.style.borderWidth = border + "px";
        _speedElement.style.borderRadius = rounding + "px";
        _speedElement.style.boxShadow = buttonShadow

        _libraryElement.style.left = 2 * margin - border;
        _libraryElement.style.width = screenWidth - (4 * margin);
        _libraryElement.style.top = margin + rowHeight + margin - border;
        _libraryElement.style.height = rowHeight;
        _libraryElement.style.fontSize = 0.75 * fontSize + "px";
        _libraryElement.style.borderWidth = border + "px";
        _libraryElement.style.borderRadius = rounding + "px";
        _libraryElement.style.boxShadow = buttonShadow

        _startElement.style.left = margin - border;
        _startElement.style.width = screenWidth - (2 * margin);
        _startElement.style.top = margin + 2 * rowHeight + 2 * margin - border;
        _startElement.style.height = rowHeight * 2 + margin;
        _startElement.style.fontSize = 2 * fontSize + "px";
        _startElement.style.borderWidth = border + "px";
        _startElement.style.borderRadius = rounding + "px";
        _startElement.style.boxShadow = buttonShadow

        _questionElement.style.left = 0;
        _questionElement.style.width = screenWidth;
        _questionElement.style.top = 0;
        _questionElement.style.height = rowHeight * 2 + 2 * margin;
        _questionElement.style.fontSize = fontSize + "px";

        _hardnessElement.style.left = 0;
        _hardnessElement.style.width = screenWidth;
        _hardnessElement.style.top = 2 * rowHeight + 3 * margin;
        _hardnessElement.style.height = rowHeight * 2 + margin;
        _hardnessElement.style.fontSize = fontSize + "px";
        _hardnessElement.style.backgroundPosition = (screenWidth / 2 - 2 * rowHeight * 0.75 / 2) + "px " + ((rowHeight * 2 + margin) / 2 - 2 * rowHeight * 0.75 / 2 + "px");
        _hardnessElement.style.backgroundSize = (2 * rowHeight * 0.75) + "px";

        _answer1Element.style.left = margin - border;
        _answer1Element.style.width = columnWidth;
        _answer1Element.style.top = margin + 2 * rowHeight + 2 * margin - border;
        _answer1Element.style.height = rowHeight;
        _answer1Element.style.fontSize = fontSize + "px";
        _answer1Element.style.borderWidth = border + "px";
        _answer1Element.style.borderRadius = rounding + "px";
        _answer1Element.style.boxShadow = buttonShadow

        _answer2Element.style.left = 2 * margin + columnWidth - border;
        _answer2Element.style.width = columnWidth;
        _answer2Element.style.top = margin + 2 * rowHeight + 2 * margin - border;
        _answer2Element.style.height = rowHeight;
        _answer2Element.style.fontSize = fontSize + "px";
        _answer2Element.style.borderWidth = border + "px";
        _answer2Element.style.borderRadius = rounding + "px";
        _answer2Element.style.boxShadow = buttonShadow

        _answer3Element.style.left = margin - border;
        _answer3Element.style.width = columnWidth;
        _answer3Element.style.top = margin + 3 * rowHeight + 3 * margin - border;
        _answer3Element.style.height = rowHeight;
        _answer3Element.style.fontSize = fontSize + "px";
        _answer3Element.style.borderWidth = border + "px";
        _answer3Element.style.borderRadius = rounding + "px";
        _answer3Element.style.boxShadow = buttonShadow

        _answer4Element.style.left = 2 * margin + columnWidth - border;
        _answer4Element.style.width = columnWidth;
        _answer4Element.style.top = margin + 3 * rowHeight + 3 * margin - border;
        _answer4Element.style.height = rowHeight;
        _answer4Element.style.fontSize = fontSize + "px";
        _answer4Element.style.borderWidth = border + "px";
        _answer4Element.style.borderRadius = rounding + "px";
        _answer4Element.style.boxShadow = buttonShadow

        _drawCardElement.style.left = margin - border;
        _drawCardElement.style.width = screenWidth - 2 * margin;
        _drawCardElement.style.top = margin - border;
        _drawCardElement.style.height = rowHeight;
        _drawCardElement.style.fontSize = fontSize + "px";
        _drawCardElement.style.borderWidth = border + "px";
        _drawCardElement.style.borderRadius = rounding + "px";

        if (rowHeight * 3 + 2 * margin < screenWidth - 2 * margin) {

            _cardBackImage.style.left = _cardImage.style.left = screenWidth / 2 - (rowHeight * 3 + 2 * margin) / 2;
            _cardBackImage.style.width = _cardImage.style.width = rowHeight * 3 + 2 * margin;
            _cardBackImage.style.top = _cardImage.style.top = margin + rowHeight + margin - border;
            _cardBackImage.style.height = _cardImage.style.height = rowHeight * 3 + 2 * margin;
        }
        else {

            _cardBackImage.style.left = _cardImage.style.left = screenWidth / 2 - (screenWidth - 2 * margin) / 2;
            _cardBackImage.style.width = _cardImage.style.width = screenWidth - 2 * margin;
            _cardBackImage.style.top = _cardImage.style.top = margin + rowHeight + margin - border + (rowHeight * 3 + 2 * margin) / 2 - (screenWidth - 2 * margin) / 2;
            _cardBackImage.style.height = _cardImage.style.height = screenWidth - 2 * margin;
        }

        _correctAnswerElement.style.left = margin - border;
        _correctAnswerElement.style.width = screenWidth - 2 * margin;
        _correctAnswerElement.style.top = margin - border;
        _correctAnswerElement.style.height = screenHeight - 2 * margin;
        _correctAnswerElement.style.fontSize = (2 * fontSize) + "px";
        _correctAnswerElement.style.borderWidth = border + "px";
        _correctAnswerElement.style.borderRadius = rounding + "px";

        _pointsElement.style.left = margin - border;
        _pointsElement.style.width = screenWidth - (2 * margin);
        _pointsElement.style.top = margin + rowHeight + margin - border;
        _pointsElement.style.height = rowHeight * 3 + 2 * margin;
        _pointsElement.style.fontSize = (3 * fontSize) + "px";
        _pointsElement.style.borderWidth = border + "px";
        _pointsElement.style.borderRadius = rounding + "px";
        _pointsElement.style.boxShadow = buttonShadow

        _answerImageElement.style.left = screenWidth / 2 - (rowHeight + 2 * margin) / 2;
        _answerImageElement.style.width = rowHeight + 2 * margin;
        _answerImageElement.style.height = rowHeight + 2 * margin;
    }

    function changeMode(mode) {

        switch (mode) {

            case modes.waiting:

                _speedElement.innerHTML = getLabel(speeds[_currentSpeed].name);
                _libraryElement.innerHTML = getLabel(kB.SmartDie.QuestionLibraries[_currentLibrary].name);
                _mainContainer.style.backgroundColor = "#88f";
                _speedElement.style.display = "";
                _libraryElement.style.display = "";
                _startElement.style.display = "";
                _questionElement.style.display = "none";
                _answer1Element.style.display = "none";
                _answer2Element.style.display = "none";
                _answer3Element.style.display = "none";
                _answer4Element.style.display = "none";
                _hardnessElement.style.display = "none";
                _pointsElement.style.display = "none";
                _answerImageElement.style.display = "none";
                _drawCardElement.style.display = "none";
                _cardImage.style.display = "none";
                _cardBackImage.style.display = "none";
                _correctAnswerElement.style.display = "none";
                break;

            case modes.showingQuestion:

                clearQuestions();
                loadQuestions(kB.SmartDie.QuestionLibraries[_currentLibrary].questions);

                _mainContainer.style.backgroundColor = "#88f";
                var questionNumber = Math.floor(Math.random() * _questions.length);
                var question = _questions[questionNumber];
                var randomQuestion = Math.floor(Math.random() * question.question.length);
                _questionElement.innerHTML = getLabel(question.question[randomQuestion]);

                var answers = [0, 1, 2, 3];
                for (var i = 0; i < 100; i++) {

                    var first = Math.floor(Math.random() * 4);
                    var second = Math.floor(Math.random() * 4);
                    var temp = answers[first];
                    answers[first] = answers[second];
                    answers[second] = temp;
                }

                _answer1Element.innerHTML = getLabel(question.answers[answers[0]]);
                _answer1Element.correct = answers[0] == 0 ? "1" : 0;
                if (_answer1Element.correct) {

                    _correctAnswerElement.innerHTML = getLabel(question.question[randomQuestion] + "&nbsp;" + question.answers[answers[0]]);
                }

                _answer2Element.innerHTML = getLabel(question.answers[answers[1]]);
                _answer2Element.correct = answers[1] == 0 ? "1" : 0;
                if (_answer2Element.correct) {

                    _correctAnswerElement.innerHTML = getLabel(question.question[randomQuestion] + "&nbsp;" + question.answers[answers[1]]);
                }

                _answer3Element.innerHTML = getLabel(question.answers[answers[2]]);
                _answer3Element.correct = answers[2] == 0 ? "1" : 0;
                if (_answer3Element.correct) {

                    _correctAnswerElement.innerHTML = getLabel(question.question[randomQuestion] + "&nbsp;" + question.answers[answers[2]]);
                }

                _answer4Element.innerHTML = getLabel(question.answers[answers[3]]);
                _answer4Element.correct = answers[3] == 0 ? "1" : 0;
                if (_answer4Element.correct) {

                    _correctAnswerElement.innerHTML = getLabel(question.question[randomQuestion] + "&nbsp;" + question.answers[answers[3]]);
                }

                _actualMaxPoints = question.level == 0
                    ? _maxPoints / 2
                    : _maxPoints;

                _pointTimeout = speeds[_currentSpeed].milliseconds;
                _graceTimeMilliseconds = _pointTimeout * 1;
                _previousPoints = _points = _maxPoints;
                _hardnessElement.className = "hardnessElement labelContainer " + (question.level == 0 ? "easy" : "hard");
                _hardnessElement.style.display = "";

                _speedElement.style.display = "none";
                _libraryElement.style.display = "none";
                _startElement.style.display = "none";

                _questionElement.style.display = "";
                _answer1Element.style.display = "none";
                _answer2Element.style.display = "none";
                _answer3Element.style.display = "none";
                _answer4Element.style.display = "none";
                _pointsElement.style.display = "none";
                _answerImageElement.style.display = "none";
                _drawCardElement.style.display = "none";
                _cardImage.style.display = "none";
                _cardBackImage.style.display = "none";
                _correctAnswerElement.style.display = "none";
                break;

            case modes.counting:

                _answer1Element.style.display = "";
                _answer2Element.style.display = "";
                _answer3Element.style.display = "";
                _answer4Element.style.display = "";
                _hardnessElement.style.display = "none";
                break;

            case modes.showingAnswer:

                _pointsElement.innerHTML = getLabel("<span class='large'>" + _points + "</span>");
                _mainContainer.style.backgroundColor = _points == 0 ? "#cc4444" : "#44cc44";
                _mainContainer.style.backgroundSize = "";
                _speedElement.style.display = "none";
                _libraryElement.style.display = "none";
                _startElement.style.display = "none";
                _questionElement.style.display = "none";
                _answer1Element.style.display = "none";
                _answer2Element.style.display = "none";
                _answer3Element.style.display = "none";
                _answer4Element.style.display = "none";
                _hardnessElement.style.display = "none";
                _pointsElement.style.display = "none";
                _answerImageElement.style.display = (Math.random() * 6 <= 1) ? "" : "none";
                _answerImageElement.src = kB.SmartDie.QuestionLibraries[_currentLibrary].images[_points == 0 ? "fail" : "ok"];
                _answerImageElement.style.top = window.innerHeight;
                _correctAnswerElement.style.display = "";
                break;

            case modes.showingPoints:

                _mainContainer.style.backgroundColor = "#88f";
                _pointsElement.style.display = "";
                _answerImageElement.style.display = "none";
                _drawCardElement.style.display = _points == 0 || kB.SmartDie.Cards.length == 0 ? "none" : "";
                _cardImage.style.display = "none";
                _cardBackImage.style.display = "none";
                _correctAnswerElement.style.display = "none";

                break;

            case modes.drawCard:
                _mainContainer.style.backgroundColor = "#88f";
                _speedElement.style.display = "none";
                _libraryElement.style.display = "none";
                _startElement.style.display = "none";
                _questionElement.style.display = "none";
                _answer1Element.style.display = "none";
                _answer2Element.style.display = "none";
                _answer3Element.style.display = "none";
                _answer4Element.style.display = "none";
                _hardnessElement.style.display = "none";
                _pointsElement.style.display = "none";
                _answerImageElement.style.display = "none";
                _drawCardElement.style.display = "none";

                var cardSize = _cardBackImage.style.height.replace("px", "");
                if (window.devicePixelRatio) {

                    cardSize *= window.devicePixelRatio;
                }

                if (_lastCardBackRasterizedSize != cardSize) {

                    _lastCardBackRasterizedSize = cardSize;
                    rasterize(kB.SmartDie.Cards[0].image, _cardBackImage, cardSize, cardSize);
                }

                _cardBackImage.style.display = "";

                _cardImage.style.display = "none";
                card = kB.SmartDie.Cards[Math.floor(Math.random() * (kB.SmartDie.Cards.length - 1)) + 1];
                rasterize(card.image, _cardImage, cardSize, cardSize);

                _correctAnswerElement.style.display = "none";
                break;

            case modes.cardDrawn:

                _cardBackImage.style.display = "none";
                _cardImage.style.width = "0px";
                _cardImage.style.display = "";
                break;
        }

        _mode = mode;
        _modeStartTime = new Date();
    }

    var _previousPoints = 0;
    function tick(time) {

        var millisecondsElapsed = time.getTime() - _modeStartTime.getTime();

        switch (_mode) {

            case modes.waiting:
                break;

            case modes.showingQuestion:

                if (millisecondsElapsed > _graceTimeMilliseconds) {

                    changeMode(modes.counting);
                }
                break;

            case modes.counting:

                var currentPoints = _actualMaxPoints - (millisecondsElapsed - _graceTimeMilliseconds) / _pointTimeout;
                if (currentPoints > _actualMaxPoints) {

                    currentPoints = _actualMaxPoints;
                }

                var intensityHi = Math.floor(255 * currentPoints / _actualMaxPoints);
                var intensityLo = Math.floor(136 * currentPoints / _actualMaxPoints);

                _mainContainer.style.backgroundColor = "rgb(" + intensityLo + "," + intensityLo + "," + intensityHi + ")";

                currentPoints = Math.ceil(currentPoints);
                if (currentPoints != _previousPoints) {

                    _points = currentPoints;
                    if (currentPoints == 0) {

                        changeMode(modes.showingAnswer);
                    }

                    _previousPoints = currentPoints;
                }
                break;

            case modes.showingAnswer:

                var answerImageHeight = 1 * _answerImageElement.style.height.replace("px", "");
                if (millisecondsElapsed < 500) {

                    _answerImageElement.style.top = window.innerHeight + answerImageHeight * Math.sin(Math.PI + Math.PI * millisecondsElapsed / 1000);
                }
                else if (millisecondsElapsed < 1500) {

                    _answerImageElement.style.top = window.innerHeight - answerImageHeight;
                }
                else if (millisecondsElapsed < 2000) {

                    _answerImageElement.style.top = window.innerHeight + answerImageHeight * Math.sin(Math.PI + Math.PI * (millisecondsElapsed - 1000) / 1000);
                }
                else if (_answerImageElement.style.top != window.innerHeight) {

                    _answerImageElement.style.top = window.innerHeight;
                    changeMode(modes.showingPoints);
                }
                break;

            case modes.showingPoints:

                if (millisecondsElapsed > 30000) {

                    changeMode(modes.waiting);
                }
                break;

            case modes.drawCard:

                var screenWidth = window.innerWidth;
                var screenHeight = window.innerHeight;

                var scale = (screenWidth > screenHeight ? screenWidth : screenHeight) / 160;
                var margin = 6 * scale;
                var rowHeight = (screenHeight - (5 * margin)) / 4;


                var cardWidthPercent = (millisecondsElapsed < 1000) || (millisecondsElapsed > 1250)
                    ? 1
                    : 1 - (millisecondsElapsed - 1000) / 250;

                var cardWidth;
                if (rowHeight * 3 + 2 * margin < screenWidth - 2 * margin) {

                    cardWidth = cardWidthPercent * (rowHeight * 3 + 2 * margin);
                }
                else {

                    cardWidth = cardWidthPercent * (screenWidth - 2 * margin);
                }

                if (millisecondsElapsed > 1250) {

                    _cardBackImage.style.display = "none";
                }

                _cardBackImage.style.left = (screenWidth / 2 - cardWidth / 2);
                _cardBackImage.style.width = cardWidth;

                if (millisecondsElapsed > 1250) {

                    changeMode(modes.cardDrawn);
                }
                break;

            case modes.cardDrawn:

                if (millisecondsElapsed < 250) {

                    var cardWidthPercent = millisecondsElapsed / 250;

                    var screenWidth = window.innerWidth;
                    var screenHeight = window.innerHeight;

                    var scale = (screenWidth > screenHeight ? screenWidth : screenHeight) / 160;
                    var margin = 6 * scale;
                    var rowHeight = (screenHeight - (5 * margin)) / 4;

                    var cardWidth;
                    if (rowHeight * 3 + 2 * margin < screenWidth - 2 * margin) {

                        cardWidth = cardWidthPercent * (rowHeight * 3 + 2 * margin);
                    }
                    else {

                        cardWidth = cardWidthPercent * (screenWidth - 2 * margin);
                    }

                    _cardImage.style.left = (screenWidth / 2 - cardWidth / 2);
                    _cardImage.style.width = cardWidth;
                }
                else if (millisecondsElapsed < 30000) {

                    if (_cardImage.style.width != _cardImage.style.height) {

                        var cardWidthPercent = 1;

                        var screenWidth = window.innerWidth;
                        var screenHeight = window.innerHeight;

                        var scale = (screenWidth > screenHeight ? screenWidth : screenHeight) / 160;
                        var margin = 6 * scale;
                        var rowHeight = (screenHeight - (5 * margin)) / 4;

                        var cardWidth;
                        if (rowHeight * 3 + 2 * margin < screenWidth - 2 * margin) {

                            cardWidth = cardWidthPercent * (rowHeight * 3 + 2 * margin);
                        }
                        else {

                            cardWidth = cardWidthPercent * (screenWidth - 2 * margin);
                        }

                        _cardImage.style.left = (screenWidth / 2 - cardWidth / 2);
                        _cardImage.style.width = cardWidth;
                    }
                }
                else {

                    changeMode(modes.waiting);
                }
                break;
        }
    }

    function animationFrame() {

        tick.call(tick, new Date());

        window.requestAnimationFrame(animationFrame);
    }

    function init() {

        initUi();
        changeMode(modes.waiting);
        updateSize();

        window.requestAnimationFrame(animationFrame);
    }

    window.onload = init;
    window.onresize = updateSize;
})();
