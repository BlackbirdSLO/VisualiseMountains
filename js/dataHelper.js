export class DataHelper {
  constructor(mountains_data) {
    this.mountains_data = mountains_data;
  }

  getTenHighestPeaks() {
    //let highestPeaks = this.tenHighestPeaks;
    return this.mountains_data
      .filter((x) => x.type.indexOf("vrh") !== -1)
      .sort((x, y) => y.height - x.height)
      .slice(0, 10);
    return;
  }

  getTenLowestPeaks() {
    return this.mountains_data
      .filter((x) => x.type.indexOf("vrh") !== -1)
      .sort((x, y) => x.height - y.height)
      .slice(0, 10);
  }

  getTenMostPopular() {
    let test = this.mountains_data;
    debugger;

    let t = this.mountains_data
      .filter((x) => x.type.indexOf("vrh") !== -1)
      .sort(
        (x, y) =>
          Number(y.views.replace(`.`, ``)) - Number(x.views.replace(`.`, ``))
      )
      .slice(0, 10);
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
