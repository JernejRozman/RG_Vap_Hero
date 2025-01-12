export class Light {
    constructor({
        color = [1, 1, 1],
        ambient = [0, 0, 0],
        smer_luci = [0, 0, -1],
        sirina_svetlobnega_snopa = Math.cos(Math.PI / 6), // Širina svetlobnega snopa
        faktor_usmerjenosti = 50, // Faktor usmerjenosti svetlobe
    } = {}) {
        this.color = color;
        this.ambient = ambient;
        this.smer_luci = smer_luci;
        this.sirina_svetlobnega_snopa = sirina_svetlobnega_snopa;
        this.faktor_usmerjenosti = faktor_usmerjenosti;
    }
}