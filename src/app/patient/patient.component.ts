import { AgGridAngular } from "ag-grid-angular";
import { formatDate } from '@angular/common';
import { Component, OnInit, ViewChild } from "@angular/core";
import { FormGroup, FormControl, Validators, AbstractControl } from "@angular/forms";
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Patient } from 'src/Models/Patient';
@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.css']
})
export class PatientComponent implements OnInit {
  constructor(private http: HttpClient) { }
  States: any;
  StateId: any;
  Cities: any;
  myform: FormGroup;
  firstName: FormControl;
  lastName: FormControl;
  gender: FormControl;
  DOB: FormControl;
  State: FormControl;
  City: FormControl;
  PatientID: FormControl;

  tempPatientID: any;
  baseURL: any = 'http://localhost:58386/';
  private entityPatient: Patient = new Patient();

  @ViewChild('agGrid') agGrid: AgGridAngular;
  columnDefs = [
    { headerName: 'Name', field: 'firstName' },
    { headerName: 'SurName', field: 'lastName' },
    { headerName: 'Gender', field: 'gender' },
    { headerName: 'DOB', field: 'dob' },
    { headerName: 'City', field: 'city' },
    { headerName: 'State', field: 'state' }
  ];
  rowData: any;

  ngOnInit() {
    this.createFormControls();
    this.createForm();
    this.LoadStatesDropDown();
    this.LoadCitiesDropDown();

    console.log('testing ' + this.PatientID);
    this.http.get(this.baseURL + 'api/Patients').subscribe(data => {
      console.log(data);
      this.rowData = <any>data;
    });
    this.gender.setValue(-1);
    this.State.setValue(-1);
    this.City.setValue(-1);
  }
  createFormControls() {
    this.PatientID = new FormControl("");
    this.firstName = new FormControl("", Validators.required);
    this.lastName = new FormControl("", Validators.required);
    this.gender = new FormControl("", Validators.required);
    this.DOB = new FormControl("", [Validators.required, this.DOBValidator]);
    this.State = new FormControl("", Validators.required);
    this.City = new FormControl("", Validators.required);
  }
  createForm() {
    this.myform = new FormGroup({
      PatientID: this.PatientID,
      firstName: this.firstName,
      lastName: this.lastName,
      gender: this.gender,
      DOB: this.DOB,
      State: this.State,
      City: this.City
    });
  }

  LoadStatesDropDown() {
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
    };
    return this.http.get(this.baseURL + 'api/states').subscribe(data => {
      console.log(data);
      this.States = <any>data;
    })
  }
  LoadCitiesDropDown() {
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
    };
    return this.http.get(this.baseURL + 'api/cities').subscribe(data => {
      console.log(data);
      this.Cities = <any>data;
    })
  }

  onDeleteRow() {
    var selectedData = this.agGrid.api.getSelectedRows();
    console.log(selectedData[0].id);
    var selectedDataString = JSON.stringify(selectedData);
    console.log(selectedDataString);
  }
  fetchPatient() {
    var selectedData = this.agGrid.api.getSelectedRows();
    if (selectedData.length == 0) {
      return;
    }
    this.PatientID = selectedData[0].id;
    this.tempPatientID = selectedData[0].id;
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
    };

    return this.http.get<Patient>(this.baseURL + 'api/Patients/' + this.PatientID, httpOptions)
      .subscribe((data: Patient) => {
        console.log(data);
        this.PatientID = new FormControl(data.PatientID);
        this.firstName = new FormControl(data.firstName, Validators.required);
        this.lastName = new FormControl(data.lastName, Validators.required);
        this.gender = new FormControl(data.gender, Validators.required);
        this.DOB = new FormControl(data.dob, [Validators.required, this.DOBValidator]);

        this.myform = new FormGroup({
          PatientID: this.PatientID,
          firstName: this.firstName,
          lastName: this.lastName,
          gender: this.gender,
          DOB: this.DOB,
          State: this.State,
          City: this.City
        });

        this.State.setValue(data.stateID);
        this.City.setValue(data.cityID);
      })
  }

  onSubmit(submittedform) {
    if (this.myform.valid) {
      console.log("Form Submitted!");
      const httpOptions = {
        headers: { 'Content-Type': 'application/json' },
      };
      if (this.tempPatientID == undefined) {
        const body = {
          firstName: submittedform.firstName, lastName: submittedform.lastName, gender: submittedform.gender,
          DOB: submittedform.DOB, stateID: +submittedform.State, cityID: +submittedform.City
        };
        console.log(body);
        this.http.post(this.baseURL + 'api/Patients', body).subscribe(data => {
          console.log(data);
          // reload patient
          this.http.get(this.baseURL + 'api/Patients').subscribe(data => {
            console.log(data);
            this.rowData = <any>data;
          });
        });
        this.myform.reset();
        this.gender.setValue(-1);
        this.State.setValue(-1);
        this.City.setValue(-1);
      }
      else {
        const body = {
          id: +this.tempPatientID, firstName: submittedform.firstName, lastName: submittedform.lastName, gender: submittedform.gender,
          dob: submittedform.DOB, stateID: +submittedform.State, cityID: +submittedform.City
        };
        console.log(body);
        this.http.put(this.baseURL + 'api/Patients/' + this.tempPatientID, body).subscribe(data => {
          console.log(data);
          // reload patient
          this.http.get(this.baseURL + 'api/Patients').subscribe(data => {
            console.log(data);
            this.rowData = <any>data;
          });
        });
        this.myform.reset();
        this.gender.setValue(-1);
        this.State.setValue(-1);
        this.City.setValue(-1);
      }
    }
  }

  changeState(e) {
    console.log(e.target.value);
    this.StateId = e.target.value;
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
    };

    return this.http.get(this.baseURL + 'api/Cities/GetCityByStateID/' + this.StateId, httpOptions).subscribe(data => {
      console.log(data);
      this.Cities = <any>data;
    })
  }

  DOBValidator(control: AbstractControl): { [key: string]: any } | null {
    let valid = false;
    let DOB = control.value;
    let date: any = formatDate(new Date(), 'yyyy-MM-dd', 'en_US')
    if (DOB != '' && DOB <= date) {
      valid = true;
    };
    return valid
      ? null
      : { invalidNumber: { valid: false, value: control.value } }
  }
}