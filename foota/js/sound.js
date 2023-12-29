export default class Sound {

    sound = null;

    constructor(file, loop) {

        this.sound = new Howl({
            src: ["./sfx/" + file],
            loop: loop === undefined ? false : loop
        });
    }

    play(volume) {

        const soundId = this.sound.play();

        if (volume !== undefined) {

            this.sound.volume(volume, soundId);
        }

        return soundId;
    }

    stop(soundId) {

        this.sound.stop(soundId);
    }
};