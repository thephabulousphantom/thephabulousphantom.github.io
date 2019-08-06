app.gfx.controls.controller = new app.gfx.Control("controller",  {

    modes: {
        question: 0,
        questionAnswers: 1,
        none: 2,
        freeze: 3
    },

    modeDuration: [
        3000,
        4000,
        1000
    ],

    speedChange: {
        correct: 1,
        incorrect: -2,
        none: -1
    },

    tiles: {
        taster: {
            off: {
                x: 0,
                y: 512,
                width: 256,
                height: 256,
                url: null
            },
            ne: {
                x: 0,
                y: 768,
                width: 256,
                height: 256,
                url: null
            },
            da: {
                x: 256,
                y: 768,
                width: 256,
                height: 256,
                url: null
            }
        }
    },

    onload: function onload(instance) {

        this.tiles.taster.off.url = "url(" + app.gfx.getTileSrc(this.tiles.taster.off.x, this.tiles.taster.off.y, this.tiles.taster.off.width, this.tiles.taster.off.height) + ")";
        this.tiles.taster.ne.url = "url(" + app.gfx.getTileSrc(this.tiles.taster.ne.x, this.tiles.taster.ne.y, this.tiles.taster.ne.width, this.tiles.taster.ne.height) + ")";
        this.tiles.taster.da.url = "url(" + app.gfx.getTileSrc(this.tiles.taster.da.x, this.tiles.taster.da.y, this.tiles.taster.da.width, this.tiles.taster.da.height) + ")";

        instance.modeDuration = [

            this.modeDuration[0],
            this.modeDuration[1],
            this.modeDuration[2]
        ];

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
            $(instance.container).find(".answer-1").text(answers[0]).css("background-image",instance.control.tiles.taster.off.url);
            $(instance.container).find(".answer-2").text(answers[1]).css("background-image",instance.control.tiles.taster.off.url);
            $(instance.container).find(".answer-3").text(answers[2]).css("background-image",instance.control.tiles.taster.off.url);
            $(instance.container).find(".answer-4").text(answers[3]).css("background-image",instance.control.tiles.taster.off.url);
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
            else if (mode == app.gfx.controls.controller.modes.none ||app.gfx.controls.controller.modes.freeze) {

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

            var correct = instance.correctAnswer == $(this).text();
            $(this)
                .addClass(correct ? "correct" : "incorrect")
                .css(
                    "background-image",
                    (correct ? instance.control.tiles.taster.da : instance.control.tiles.taster.ne).url
                );            
            
            app.gfx.press(this, (function() {

                instance.answer = $(this).text();
                $(this)
                    .removeClass("correct")
                    .removeClass("incorrect")
                    .css("background-image", "none");

            }).bind(this));

            e.preventDefault();
        }

        instance.updateModeDurations = function updateModeDurations(speed) {

            for (var i = 0; i < this.modeDuration.length; i++) {
                
                instance.modeDuration[i] = this.modeDuration[i] / ((1 - 1 / 200) + (speed / 200));
            }
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

        if (instance.player.freezeBy) {

            if (instance.mode != app.gfx.controls.controller.modes.freeze) {

                instance.updateMode(app.gfx.controls.controller.modes.freeze);
            }
        }

        switch (instance.mode) {

            case app.gfx.controls.controller.modes.freeze:

                if (!instance.player.freezeBy) {

                    instance.updateQuestionAndAnswers(instance.player.questions, instance.player.random);

                    instance.modeStartTime = time;
                    instance.updateMode(app.gfx.controls.controller.modes.question);
                }
                break;

            case app.gfx.controls.controller.modes.none:
                if (time - instance.modeStartTime > instance.modeDuration[app.gfx.controls.controller.modes.none]) {

                    instance.updateQuestionAndAnswers(instance.player.questions, instance.player.random);

                    instance.modeStartTime = time;
                    instance.updateMode(app.gfx.controls.controller.modes.question);
                }
                break;

            case app.gfx.controls.controller.modes.question:
                if (time - instance.modeStartTime > instance.modeDuration[app.gfx.controls.controller.modes.question]) {

                    instance.modeStartTime = time;
                    instance.answer = null;
                    instance.updateMode(app.gfx.controls.controller.modes.questionAnswers);
                }                
                break;

            case app.gfx.controls.controller.modes.questionAnswers:
                if (time - instance.modeStartTime > instance.modeDuration[app.gfx.controls.controller.modes.questionAnswers]) {

                    instance.speed += app.gfx.controls.controller.speedChange.none;

                    instance.modeStartTime = time;
                    instance.updateMode(app.gfx.controls.controller.modes.none);
                }
                else if (instance.answer != null) {

                    if (instance.answer == instance.correctAnswer) {

                        instance.speed += app.gfx.controls.controller.speedChange.correct;
                        //app.gfx.jump(instance.player.car.el());
                    }
                    else {

                        instance.speed += app.gfx.controls.controller.speedChange.incorrect;
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