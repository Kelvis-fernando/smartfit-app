import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Location } from 'src/app/interfaces/location.interface';
import { GetUnitsService } from 'src/app/services/get-units.service';

const OPENING_HOURS = {
  morning: { first: '06', last: '12' },
  afternoon: { first: '12', last: '18' },
  night: { first: '18', last: '23' },
};

type HourIndexes = 'morning' | 'afternoon' | 'night';

@Component({
  selector: 'app-forms',
  templateUrl: './forms.component.html',
  styleUrls: ['./forms.component.scss'],
})
export class FormsComponent {
  results: Location[] = [];
  filteredResults: Location[] = [];
  formGroup!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private unitService: GetUnitsService
  ) {}

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({ hour: '', showClosed: true });
    this.unitService.getAllUnits().subscribe((data) => {
      this.results = data.locations;
      this.filteredResults = data.locations;
    });
  }

  formatWeekday(day: number) {
    switch (day) {
      case 0:
        return 'Dom.';
      case 6:
        return 'Sáb.';
      default:
        return 'Seg. à Sex.';
    }
  }

  filterUnits(unit: Location, open_hour: string, close_hour: string) {
    let open_hour_filter = parseInt(open_hour, 10);
    let close_hour_filter = parseInt(close_hour, 10);

    let todays_weekday = this.formatWeekday(new Date().getDay());

    for (let i = 0; i < unit.schedules.length; i++) {
      let schedule_hour = unit.schedules[i].hour;
      let schedule_weekday = unit.schedules[i].weekdays;

      if (todays_weekday === schedule_weekday) {
        if (schedule_hour !== 'Fechada') {
          let [unit_open_hour, unit_close_hour] = schedule_hour.split(' às ');
          let unit_open_hour_int = parseInt(
            unit_open_hour.replace('h', ''),
            10
          );
          let unit_close_hour_int = parseInt(
            unit_open_hour.replace('h', ''),
            10
          );

          if (
            unit_open_hour_int >= open_hour_filter &&
            unit_close_hour_int >= close_hour_filter
          ) {
            return true;
          } else {
            return false;
          }
        }
      }

      return false;
    }
  }

  onSubmit(): void {
    const OPEN_HOUR =
      OPENING_HOURS[this.formGroup.value.hour as HourIndexes].first;
    const CLOSE_HOUR =
      OPENING_HOURS[this.formGroup.value.hour as HourIndexes].last;
    if (!this.formGroup.value.showClosed) {
      this.filteredResults = this.results.filter(
        (location) => location.opened === true
      );
    } else {
      this.filteredResults = this.results;
    }
  }

  onClean(): void {
    this.formGroup.reset();
  }
}
