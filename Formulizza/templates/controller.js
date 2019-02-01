app.gfx.controls.controller = new app.gfx.Control("controller",  {

    modes: {
        question: 0,
        questionAnswers: 1,
        none: 2
    },

    modeDuration: [
        2000,
        3000,
        1000
    ],

    speedChange: {
        correct: 0.5,
        incorrect: -2.5,
        none: -1
    },

    onload: function onload(instance) {

        instance.setColor = function setColor(color) {

            switch (color) {
                case "red":
                    $(instance.container).removeClass("blue");
                    $(instance.container).addClass("red");
                    break;

                case "blue":
                    $(instance.container).removeClass("red");
                    $(instance.container).addClass("blue");
                    break;
            }
        };

        instance.updateQuestionAndAnswers = function updateQuestionAndAnswers(questions, random) {

            var questionNumber =
                (((random ? Math.random() : 0) * questions.length) % questions.length) | 0;

            var question = questions[questionNumber].question[(((random ? Math.random() : 0) * 1000) % questions[questionNumber].question.length) | 0];

            var answers = [
                questions[questionNumber].answers[0],
                questions[questionNumber].answers[1],
                questions[questionNumber].answers[2],
                questions[questionNumber].answers[3]];

            instance.correctAnswer = answers[0];
                
            if (random) {

                for (var i = 0; i < 20; i++) {

                    var j = ((Math.random() * 4) % 4) | 0;
                    var k = ((Math.random() * 4) % 4) | 0;

                    var t = answers[j];
                    answers[j] = answers[k];
                    answers[k] = t;
                }
            }

            instance.level = questions[questionNumber].level + 1;

            $(instance.container).find(".question>div").text(question);
            $(instance.container).find(".answer-1").text(answers[0]);
            $(instance.container).find(".answer-2").text(answers[1]);
            $(instance.container).find(".answer-3").text(answers[2]);
            $(instance.container).find(".answer-4").text(answers[3]);
        };

        instance.mode = null;

        instance.speed = 0;

        instance.updateMode = function updateMode(mode) {

            var element = $(instance.container).find(">:first-child");

            if (mode == app.gfx.controls.controller.modes.questionAnswers) {

                instance.container.style.display = "";
                if (!element.hasClass("answers-shown")) {

                    element.addClass("answers-shown");
                }
            }
            else if (mode == app.gfx.controls.controller.modes.question) {

                instance.container.style.display = "";
                if (element.hasClass("answers-shown")) {

                    element.removeClass("answers-shown");
                }
            }
            else if (mode == app.gfx.controls.controller.modes.none) {

                instance.container.style.display = "none";
            }

            return instance.mode = mode;
        }

        instance.updateMode(app.gfx.controls.controller.modes.none);

        instance.answers = [
            document.querySelector("#" + instance.id + " .answer-1"),
            document.querySelector("#" + instance.id + " .answer-2"),
            document.querySelector("#" + instance.id + " .answer-3"),
            document.querySelector("#" + instance.id + " .answer-4")
        ];

        instance.onAnswerClick = function(e) {

            app.gfx.press(this, (function() {

                instance.answer = $(this).text();

            }).bind(this));

            e.preventDefault();
        }

        app.pointer.onpress(instance.answers[0], instance.onAnswerClick.bind(instance.answers[0]));
        app.pointer.onpress(instance.answers[1], instance.onAnswerClick.bind(instance.answers[1]));
        app.pointer.onpress(instance.answers[2], instance.onAnswerClick.bind(instance.answers[2]));
        app.pointer.onpress(instance.answers[3], instance.onAnswerClick.bind(instance.answers[3]));

        instance.modeStartTime = null;

        instance.setColor(instance.player.color);
    },

    onrenderframe: function onrenderframe(instance, frame, duration, time) {

        if (instance.modeStartTime == null) {

            instance.modeStartTime = time;
            return;
        }

        switch (instance.mode) {

            case app.gfx.controls.controller.modes.none:
                if (time - instance.modeStartTime > app.gfx.controls.controller.modeDuration[app.gfx.controls.controller.modes.none]) {

                    instance.updateQuestionAndAnswers(instance.player.questions, instance.player.random);

                    instance.modeStartTime = time;
                    instance.updateMode(app.gfx.controls.controller.modes.question);
                }
                break;

            case app.gfx.controls.controller.modes.question:
                if (time - instance.modeStartTime > app.gfx.controls.controller.modeDuration[app.gfx.controls.controller.modes.question]) {

                    instance.modeStartTime = time;
                    instance.answer = null;
                    instance.updateMode(app.gfx.controls.controller.modes.questionAnswers);
                }                
                break;

            case app.gfx.controls.controller.modes.questionAnswers:
                if (time - instance.modeStartTime > app.gfx.controls.controller.modeDuration[app.gfx.controls.controller.modes.questionAnswers]) {

                    instance.speed += app.gfx.controls.controller.speedChange.none / instance.level;

                    instance.modeStartTime = time;
                    instance.updateMode(app.gfx.controls.controller.modes.none);
                }
                else if (instance.answer != null) {

                    if (instance.answer == instance.correctAnswer) {

                        instance.speed += app.gfx.controls.controller.speedChange.correct * instance.level;
                    }
                    else {

                        instance.speed += app.gfx.controls.controller.speedChange.incorrect / instance.level;
                    }

                    instance.modeStartTime = time;
                    instance.updateMode(app.gfx.controls.controller.modes.none);
                }
                break;
        }
    },

    onunload: function onunload(instance) {

    }
});