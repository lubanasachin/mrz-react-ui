import React, { Component } from 'react';
import moment from 'moment';

import { FormErrors } from './FormErrors';
import countriesList from '../data/countries.json';
import './Form.css';

class Form extends Component {
    constructor (props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.state = {
            mrzCode: '',
            formFields: {
                firstName: '',
                lastName: '',
                passportNumber: '',
                personalNumber: '',
                countryCode: '',
                nationality: '',
                gender: '',
                birthday: '',
                validUntilDay: ''
            },
            formErrors: {
                firstName:      {name: 'First name', valid: true, message: ''},
                lastName:       {name: 'Last name', valid: true, message: ''},
                gender:         {name: 'Gender', valid: true, message: ''},
                birthday:       {name: 'Birthday', valid: true, message: ''},
                countryCode:    {name: 'Country code', valid: true, message: ''},
                nationality:    {name: 'Nationality', valid: true, message: ''},
                passportNumber: {name: 'Passport number', valid: true, message: ''},
                validUntilDay:  {name: 'Passport Valid Till', valid: true, message: ''},
                personalNumber: {name: 'Personal ID Number', valid: true, message: ''}
            },
            formValid: false
        }
    }

    /*fill default values in the form for testing*/
    setDefaultState = (e) => {
        const defaultFieldValues = {
                firstName: 'Sachin',
                lastName: 'Lubana',
                passportNumber: 'M1210761',
                personalNumber: '12345678901234',
                countryCode: 'IND',
                nationality: 'IND',
                gender: 'M',
                birthday: '16.01.1989',
                validUntilDay: '24.06.2024'
        };        
        this.setState({formFields: defaultFieldValues, formValid: true});
    }

    /*handle user input triggered on field change or blur event*/
    handleUserInput = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        let formFields = {...this.state.formFields};
        formFields[name] = value;
        this.setState({formFields}, () => { this.validateField(name, value) });
    }

    /*handle form submit*/
    handleSubmit =  async event => {
        event.preventDefault();
        const data = this.state.formFields;

        const response = await fetch('/api/mrz/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        const body = await response.json();
        this.setState({mrzCode: body.code});
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /*validate name properties of user*/
    validateName = (value, field) => {
        const fieldValidationErrors = this.state.formErrors;
        const reg = /^[a-zA-Z ,.'-]+$/i;
        const fieldName = fieldValidationErrors[field]['name'];
        if(value === '') {
            fieldValidationErrors[field]['valid'] = false;
            fieldValidationErrors[field]['message'] =  fieldName+' is required';
            this.setState({formErrors: fieldValidationErrors});
        } else if(!value.match(reg)) {
            fieldValidationErrors[field]['valid'] = false;
            fieldValidationErrors[field]['message'] =  fieldName+' is invalid';
            this.setState({formErrors: fieldValidationErrors});
        } else {
            fieldValidationErrors[field]['valid'] = true;
            fieldValidationErrors[field]['message'] = '';
        }
    }

    /*validate date properties like birthday of user*/
    validateDate = (value, field) => {
        const fieldValidationErrors = this.state.formErrors;
        const fieldName = fieldValidationErrors[field]['name'];

        if(value === '') {
            fieldValidationErrors[field]['valid'] = false;
            fieldValidationErrors[field]['message'] =  fieldName+' is required';
            this.setState({formErrors: fieldValidationErrors});
            return;
        } 
        
        const date = moment(value, 'DD.MM.YYYY', true);
        if(!date.isValid()) {
            fieldValidationErrors[field]['valid'] = false;
            fieldValidationErrors[field]['message'] =  fieldName+' date is invalid';
            this.setState({formErrors: fieldValidationErrors});
            return;
        }

        if(field === 'birthday') {
            if(moment(date).isAfter(moment())) {
                fieldValidationErrors[field]['valid'] = false;
                fieldValidationErrors[field]['message'] =  fieldName+' cannot be in future';
                this.setState({formErrors: fieldValidationErrors});
                return;
            }
        }

        if(field === 'validUntilDay') {
            if(moment(date).isBefore(moment())) {
                fieldValidationErrors[field]['valid'] = false;
                fieldValidationErrors[field]['message'] =  fieldName+' cannot be in past';
                this.setState({formErrors: fieldValidationErrors});
                return;
            }
        }

        fieldValidationErrors[field]['valid'] = true;
        fieldValidationErrors[field]['message'] = '';
    }   

    /*validate identity properties like passport of user*/
    validateIDData = (value, field) => {
        const fieldValidationErrors = this.state.formErrors;
        const fieldName = fieldValidationErrors[field]['name'];
        if(value === '') {
            fieldValidationErrors[field]['valid'] = false;
            fieldValidationErrors[field]['message'] =  fieldName+' is required';
            this.setState({formErrors: fieldValidationErrors});
            return;
        }        
    
        if(field === 'passportNumber') {
            const reg = /^[A-PR-WY][1-9]\d\s?\d{4}[1-9]$/ig;
            if(value.length > 9 || !value.match(reg)) {
                fieldValidationErrors[field]['valid'] = false;
                fieldValidationErrors[field]['message'] =  fieldName+' is invalid';
                this.setState({formErrors: fieldValidationErrors});
                return;
            }
        }

        fieldValidationErrors[field]['valid'] = true;
        fieldValidationErrors[field]['message'] = '';
    }

    /*validate user fields*/
    validateField(fieldName, value) {
        switch(fieldName) {
            case 'firstName':
            case 'lastName':
                this.validateName(value, fieldName);
                break;
            case 'birthday':
            case 'validUntilDay':
                this.validateDate(value, fieldName);
                break;
            case 'passportNumber':
            case 'personalNumber':
                this.validateIDData(value, fieldName);
                break;
            default:
                break;
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.validateForm();
    }

    /*check if form is valid*/
    validateForm() {
        let isFormValid = true;
        const fieldValidationErrors = this.state.formErrors;
        for (var k in fieldValidationErrors) {
            if (fieldValidationErrors.hasOwnProperty(k)) {
                if(!fieldValidationErrors[k]['valid']) {
                    isFormValid = false
                    return;
                }
            }
        } 
        this.setState({formValid: isFormValid});
    }

    errorClass(error) {
        return(error.length === 0 ? '' : 'has-error');
    }

    /*main render function to render JSX page content*/
    render () {

        let output;
        if(this.state.mrzCode) {
            output = <div className='outputDiv'>{this.state.mrzCode}</div>;
        }

        var countryItems = countriesList.map(function(item) {
            return (
                <option value={item.code}>{item.name}</option>
            );
        });

        return (
        <form className="demoForm" onSubmit={this.handleSubmit} >

            {output}

            <div className="panel panel-default">
                <FormErrors formErrors={this.state.formErrors} />
            </div>

            <div className={`form-group ${this.errorClass(this.state.formErrors.firstName)}`}>
                <label className="txtLabel" htmlFor="firstName">First Name</label>
                <input type="text" required className="form-control" maxLength="30" name="firstName" 
                    placeholder="First name" value={this.state.formFields.firstName} onChange={this.handleUserInput}  onBlur={this.handleUserInput}
                />
            </div>

            <div className={`form-group ${this.errorClass(this.state.formErrors.lastName)}`}>
                <label className="txtLabel" htmlFor="lastName">Last Name</label>
                <input type="text" required className="form-control" maxLength="30" name="lastName" 
                    placeholder="Last name" value={this.state.formFields.lastName} onChange={this.handleUserInput} onBlur={this.handleUserInput} 
                />  
            </div>

            <div className={`form-group ${this.errorClass(this.state.formErrors.gender)}`}>
                <label className="txtLabel" htmlFor="gender">Gender</label>
                <select className="form-control" name="gender" value={this.state.formFields.gender} onChange={this.handleUserInput}>
                    <option value='M'>Male</option>
                    <option value='F'>Female</option>
                    <option value='<'>Others</option>
                </select>
            </div>

            <div className={`form-group ${this.errorClass(this.state.formErrors.birthday)}`}>
                <label className="txtLabel" htmlFor="birthday">Date Of Birth</label>
                <input type="text" required className="form-control" name="birthday" 
                    placeholder="16.01.1989" value={this.state.formFields.birthday} onChange={this.handleUserInput}  onBlur={this.handleUserInput} 
                />
            </div>

            <div className={`form-group ${this.errorClass(this.state.formErrors.countryCode)}`}>
                <label className="txtLabel" htmlFor="countryCode">Country</label>
                <select className="form-control" name="countryCode" value={this.state.formFields.countryCode} onChange={this.handleUserInput}>
                {countryItems}
                </select>
            </div>
        
            <div className={`form-group ${this.errorClass(this.state.formErrors.nationality)}`}>
                <label className="txtLabel" htmlFor="nationality">Nationality</label>
                <select className="form-control" name="nationality" value={this.state.formFields.nationality} onChange={this.handleUserInput}>
                {countryItems}
                </select>
            </div>

            <div className={`form-group ${this.errorClass(this.state.formErrors.passportNumber)}`}>
                <label className="txtLabel" htmlFor="passportNumber">Passport Number</label>
                <input type="text" required className="form-control" maxLength="9" name="passportNumber" 
                    placeholder="M1210761" value={this.state.formFields.passportNumber} onChange={this.handleUserInput} onBlur={this.handleUserInput}  
                />
            </div>

            <div className={`form-group ${this.errorClass(this.state.formErrors.validUntilDay)}`}>
                <label className="txtLabel" htmlFor="passportValidTill">Passport Expiration Date</label>
                <input type="text" required className="form-control" name="validUntilDay" 
                    placeholder="23.02.2035" value={this.state.formFields.validUntilDay} onChange={this.handleUserInput}  onBlur={this.handleUserInput}
                />
            </div>

            <div className={`form-group ${this.errorClass(this.state.formErrors.personalNumber)}`}>
                <label className="txtLabel" htmlFor="personalNumber">Personal Number</label>
                <input type="text" required className="form-control" name="personalNumber" 
                    placeholder="12345678901234" value={this.state.formFields.personalNumber} onChange={this.handleUserInput}  
                />
            </div>

            <button type="submit" className="btn btn-primary" disabled={!this.state.formValid}>Generate</button>
            &nbsp; <button type="button" className="btn btn-default" onClick={this.setDefaultState} >Fill Default</button>
     
        </form>
    )
  }
}

export default Form;
