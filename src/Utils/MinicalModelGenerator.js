import moment from 'moment';


// import { TOTAL_DAY_MS } from '../../../../config';

/* Generates an array with date objects which
can be used to power data providers of the recycler list view */
export default class CalenderModelGenerator {
  constructor(centerDateMom) {
    // Computing dates of day start
    const curMonthStartMom = moment().startOf('month').add(15, 'days');
    this.centerDateMom = centerDateMom || moment();
    this.startDateMom = curMonthStartMom.clone().subtract(2, 'years');
    this.endDateMom = curMonthStartMom.clone().add(2, 'years');
    // this.startDate = new Date(currentDate.getFullYear() - 2, 0, 1, 0, 0, 0, 1);
    // this.endDate = new Date(currentDate.getFullYear() + 2, 0, 1, 0, 0, 0, 1);

    this.model = [];
    this.currentDateIndex = 0;
    this.initialCompute();
  }

  /* Generating the array, dates are incremented by
  adding number of milliseconds in a day to last added timestamp */
  initialCompute() {
    const iterMoment = this.startDateMom.clone();
    let it = 0;
    while (iterMoment.isBefore(this.endDateMom)) {
      if (iterMoment.isSame(this.centerDateMom, 'month')) {
        this.currentDateIndex = it;
      }
      this.model.push({
        date: iterMoment.toDate(),
      });
      iterMoment.add(1, 'month');
      it += 1;
    }
  }

  getModel() {
    return this.model;
  }

  getCurrentDateIndex() {
    if (this.currentDateIndex === 0) {
      this.initialCompute();
      if (this.currentDateIndex === 0) {
        console.log('MinicalModelGenerator -> this.currentDateIndex === 0 after initialCompute', true);
      }
    }
    return this.currentDateIndex;
  }

  // Used to add more dates to the calender as you scroll down
  // ensureYear(year) {
  //   let startMS = this.startDate.getTime();
  //   let endMS = this.endDate.getTime();
  //   const targetMS = new Date(year, 1).getTime();
  //   while (startMS > targetMS) {
  //     startMS -= TOTAL_DAY_MS;
  //     this.model.push({
  //       date: new Date(startMS),
  //     });
  //   }
  //   while (endMS <= targetMS) {
  //     endMS += TOTAL_DAY_MS;
  //     this.model.push({
  //       date: new Date(endMS),
  //     });
  //   }
  //   this.startDate = new Date(startMS);
  //   this.endDate = new Date(endMS);
  // }

  // getStartDate() {
  //   return this.startDate;
  // }

  // getEndDate() {
  //   return this.endDate;
  // }
}
