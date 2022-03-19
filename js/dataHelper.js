export class DataHelper {
  constructor(mountains_data) {
    this.mountains_data = mountains_data;
  }

  getHighestPeaks(count) {
    //let highestPeaks = this.tenHighestPeaks;
    return this.mountains_data
      .filter(
        (x) => x.type.indexOf("vrh") !== -1 && x.peakRoutes.length > 3
        /* &&
          x.peaksite === "Kamniško Savinjske Alpe"*/
      )
      .sort((x, y) => y.height - x.height)
      .slice(0, count);
  }

  getLowestPeaks(count) {
    return this.mountains_data
      .filter((x) => x.type.indexOf("vrh") !== -1)
      .sort((x, y) => x.height - y.height)
      .slice(0, count);
  }

  getMostPopular(count) {
    let t = this.mountains_data
      .filter((x) => x.type.indexOf("vrh") !== -1)
      .sort(
        (x, y) =>
          Number(y.views.replace(`.`, ``)) - Number(x.views.replace(`.`, ``))
      )
      .slice(0, count);
    console.log(t);
    return t;
  }

  getTenWithMostRoutes() {
    // we could just take routesTotal here, but the number doesn't match the actual listed data?
    return mountains_data
      .sort((x, y) => y.peakRoutes.length - x.peakRoutes.length)
      .slice(0, 10);
  }

  /* Legacy */
  getPrekmurjeData() {
    return mountains_data.filter((x) => x.peaksite === "Prekmurje");
  }

  getKaravankeData() {
    return mountains_data.filter((x) => x.peaksite === "Karavanke");
  }

  getJulijskeData() {
    return mountains_data.filter((x) => x.peaksite === "Julijske Alpe");
  }

  getKamniskeData() {
    return mountains_data.filter((x) => x.peaksite === "Kamniško Savinjske");
  }
}
