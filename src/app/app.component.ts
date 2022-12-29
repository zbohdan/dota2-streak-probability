import {Component, NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  gamesCount = 5000;
  streakValue = 12;
  probability: number | null = null;
  probabilityDisplay = '';
  isCalculated = false;
  // shouldShowExplanatoryBrigade = false;
  //
  //
  // showExplanatoryBrigade() {
  //   this.shouldShowExplanatoryBrigade = true
  // }

  calculateProbabilityOfTaskFromWikipedia(sequenceLength: bigint, experimentsCount: bigint): BigDecimal {
    const fKth = this.calculateKthElementOfTheNNacciSequence(sequenceLength, experimentsCount);
    console.log('fKth', fKth);
    const bottomValue = 2n ** experimentsCount;
    console.log('bottomValue', bottomValue);
    console.log('fKth/bottomValue', fKth / bottomValue);
    const fixedProb = Number(fKth * 100n / bottomValue) / 100
    console.log('fixed fKth/bottomValue', fixedProb);

    const fKthBigDecimal = BigDecimal.fromBigInt(fKth);
    const bottomValueBigDecimal = BigDecimal.fromBigInt(bottomValue);
    const div = fKthBigDecimal.divide(bottomValueBigDecimal);
    console.log('big decimal div', div);
    console.log('big decimal res', new BigDecimal(1).subtract(div).multiply(new BigDecimal(100)).toString() + "%")

    return div;
  }

  calculateProbability(streakValue: number, gamesCount: number): void {
    this.isCalculated = true;
    const probFromWiki = this.calculateProbabilityOfTaskFromWikipedia(BigInt(streakValue), BigInt(gamesCount))
    console.log('probFromWiki', probFromWiki)
    this.probability = new BigDecimal(1).subtract(probFromWiki).multiply(new BigDecimal(100)).toString();
    this.probabilityDisplay = `${this.probability}%`
  }

  calculateKthElementOfTheNNacciSequence(sequenceLength: bigint, experimentsCount: bigint): bigint {
    const elementNumber = experimentsCount + 2n;
    const nNacciOrder = sequenceLength;

    const amountOfZeros = nNacciOrder - 1n;
    const amountOfNumbers = amountOfZeros + elementNumber;

    const series = this.bonacciseries(nNacciOrder, amountOfNumbers);
    console.log('series', series);

    return series[series.length - 1];
  }

  // Function to print bonacci series
  bonacciseries(nNacciOrder: bigint, amountOfNumbers: bigint) {
    // Assuming m >= n.
    let a = Array(Number(amountOfNumbers)).fill(0n);
    a[Number(nNacciOrder) - 1] = 1n;

    // Computing every term as sum of previous n terms.
    for (let i = nNacciOrder; i < amountOfNumbers; i = i + 1n) {
      for (let j = i - nNacciOrder; j < i; j = j + 1n) {
        a[Number(i)] += a[Number(j)];
      }
    }

    return a
  }
}

class BigDecimal {
  // Configuration: constants
  _n = 1n;
  static DECIMALS = 15; // number of decimals on all instances
  static ROUNDED = true; // numbers are truncated (false) or rounded (true)
  static SHIFT = BigInt("1" + "0".repeat(BigDecimal.DECIMALS)); // derived constant
  constructor(value: any) {
    if (value instanceof BigDecimal) return value;
    let [ints, decis] = String(value).split(".").concat("");
    this._n = BigInt(ints + decis.padEnd(BigDecimal.DECIMALS, "0")
        .slice(0, BigDecimal.DECIMALS))
      + BigInt(BigDecimal.ROUNDED && decis[BigDecimal.DECIMALS] >= "5");
  }

  static fromBigInt(bigint: bigint) {
    return Object.assign(Object.create(BigDecimal.prototype), {_n: bigint});
  }

  add(num: any) {
    return BigDecimal.fromBigInt(this._n + new BigDecimal(num)._n);
  }

  subtract(num: any) {
    return BigDecimal.fromBigInt(this._n - new BigDecimal(num)._n);
  }

  static _divRound(dividend: bigint, divisor: bigint) {
    return BigDecimal.fromBigInt(dividend / divisor
      + (BigDecimal.ROUNDED ? dividend * 2n / divisor % 2n : 0n));
  }

  multiply(num: any) {
    return BigDecimal._divRound(this._n * new BigDecimal(num)._n, BigDecimal.SHIFT);
  }

  divide(num: any) {
    return BigDecimal._divRound(this._n * BigDecimal.SHIFT, new BigDecimal(num)._n);
  }

  toString() {
    const s = this._n!.toString().padStart(BigDecimal.DECIMALS + 1, "0");
    return s.slice(0, -BigDecimal.DECIMALS) + "." + s.slice(-BigDecimal.DECIMALS)
      .replace(/\.?0+$/, "");
  }
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
