import React from 'react';
import ReactDOM from 'react-dom';
import jQuery from 'jquery';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import InputRange from 'react-input-range';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import Alert from 'react-s-alert';
import {RegisterForm, LoginForm, UserTable} from './rest_auth.js';
import {SimpleSelect} from 'react-selectize';

import 'react-s-alert/dist/s-alert-default.css';
import 'react-selectize/themes/index.css'

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

export class JogApp extends React.Component {

    constructor() {
        super();
        this.state = {};
        this.handleClick = this._handleClick.bind(this);
        this.getUserInfo = this._getUserInfo.bind(this);
        this.submitLogoutForm = this._submitLogoutForm.bind(this);
        this.handleLogout = this._handleLogout.bind(this);
    }
    _handleClick(e) {
        let tab = e.target.getAttribute('data-id');
        this.setState({activeTab: tab});
    }

    _getUserInfo() {
        jQuery.ajax({
            url: '/get-user-info/',
            dataType: 'json',
            cache: false,
            success: function(userInfo) {
                this.setState(userInfo);
            }.bind(this),
            error: function(xhr, status, err) {
                console.error('/get-user-info/', status, err.toString());
            }.bind(this)
        });
    }

    _submitLogoutForm(data) {
        data['csrfmiddlewaretoken'] = getCookie('csrftoken');
        console.log(data);
        this.setState({});
        jQuery.ajax({
            url: '/rest-auth/logout/',
            dataType: 'json',
            type: 'POST',
            data: data,
            success: function(jogList) {
                this.getUserInfo();
            }.bind(this),
            error: function(xhr, status, err) {
                Alert.error('Please try again later', {position: 'bottom-left'});
                console.error('/rest-auth/logout/', status, err.toString());
            }.bind(this)
        });
    }

    _handleLogout(e) {
        e.preventDefault();
        this.submitLogoutForm({});
    }

    componentDidMount() {
        this.getUserInfo();
    }

    render() {
        if(!this.state) {
            return null;
        }
        if(!this.state.authenticated) {
            return (
                <div className="main-root-div">
                    <nav className="navigation">
                        <section className="container">
                            <a className="navigation-title" href="#">
                                <h1 className="title" data-id='myJogs' onClick={this.handleClick}>Jog Tracker</h1>
                            </a>
                        </section>
                    </nav>
                    <div className="header">
                        <section className="header-container">
                            <h1> Hey there, Welcome to Jog Tracker!</h1>
                            <p> Helps you track your jogging activities and analyze stats </p>
                        </section>
                    </div>
                    <div className="register-login-form">
                        <div className="register-form">
                            <h2> Register </h2>
                            <RegisterForm getUserInfo={this.getUserInfo} />
                        </div>
                        <div className="vertical-line" />
                        <div className="login-form">
                            <h2> Login </h2>
                            <LoginForm getUserInfo={this.getUserInfo} />
                        </div>
                    </div>
                    <Alert stack={{limit: 3}} />
                </div>
            );
        } else {
            return (
                <div className="main-root-div">
                    <nav className="navigation">
                        <section className="container">
                            <a className="navigation-title" href="#">
                                <h1 className="title" data-id='myJogs' onClick={this.handleClick}>Jog Tracker</h1>
                            </a>
                            <ul className="navigation-list float-right">

                                <li className="navigation-item">
                                    <a className="navigation-link" href="#" data-id='myJogs' onClick={this.handleClick}>My Jogs</a>
                                </li>
                                { this.state.manageUsers &&
                                <li className="navigation-item">
                                    <a className="navigation-link" href="#" data-id='manageUsers' onClick={this.handleClick}>Manage Users</a>
                                </li>
                                }
                                { this.state.manageApp &&
                                <li className="navigation-item">
                                    <a className="navigation-link" href="#" data-id='manageApp' onClick={this.handleClick}>Manage App Data</a>
                                </li>
                                }
                                <li className="navigation-item">
                                    <a className="navigation-link" href="#" onClick={this.handleLogout}>Logout</a>
                                </li>
                            </ul>
                        </section>
                    </nav>
                    <div className="header">
                        <section className="header-container">
                            <h1> Hey {this.state.username}, Welcome to Jog Tracker!</h1>
                            <p> Helps you track your jogging activities and analyze stats </p>
                        </section>
                    </div>
                    {
                        this.state.activeTab === 'myJogs' &&
                        <div className="body">
                            <div className="jog-list">
                                <JogTable getUrl={`/user-jogs/${this.state.user_id}/`} postUrl={`/jog/`} showUsername={false} user_id={this.state.user_id}/>
                            </div>
                        </div>
                    }
                    {
                        this.state.activeTab === 'manageUsers' &&
                        <div className="body">
                            <div className="jog-list">
                                <UserTable />
                            </div>
                        </div>
                    }
                    {
                        this.state.activeTab === 'manageApp' &&
                        <div className="body">
                            <div className="jog-list">
                                <JogTable getUrl={`/user-jogs/`} postUrl={`/jog/`} showUsername={true} />
                            </div>
                        </div>
                    }
                    <Alert stack={{limit: 3}} />
                </div>
            );
        }
    }
}


class EditJogElement extends React.Component {
    getMomentDate(timestamp) {
        // "Feb 17, 2017" to ["Feb 17", "2017"]
        let ts = timestamp.split(',');
        let year = parseInt(ts[1]);
        // "Feb 17" to ["Feb", "17"]
        ts = ts[0].split(' ')
        let month = ts[0];
        let date = parseInt(ts[1]);
        return moment().set({'year': year, 'month': month, 'date': date});
    }
    constructor() {
        super();

        this.state = {
            isShowingModal: false,
        };
        this.handleClick = this._handleClick.bind(this);
        this.handleClose = this._handleClose.bind(this);
    }
    _handleClick() {
        this.setState({isShowingModal: true});
    }
    _handleClose() {
        this.setState({isShowingModal: false});
    }
    render() {
        let jog_date = this.getMomentDate(this.props.data.timestamp);
        return (
            <i className="icon ion-edit" data-id={this.props.jog_id} onClick={this.handleClick}>
            {
                this.state.isShowingModal &&
                <ModalContainer>
                  <ModalDialog>
                    <JogEntryForm
                        edit={true}
                        jog_id={this.props.data.jog_id}
                        onJogEditSubmit={this.props.onJogEditSubmit}
                        user_id={this.props.data.user_id}
                        distance={this.props.data.distance/1000}
                        duration={this.props.data.duration/60}
                        timestamp={jog_date}
                        closeModal={this.handleClose}
                    />
                  </ModalDialog>
                </ModalContainer>
            }
            </i>
        );
    }
}

class JogElement extends React.Component {

    render() {
        return (
            <tr>
                {this.props.showUsername && <td>{this.props.data.username}</td>}
                <td>{this.props.data.timestamp}</td>
                <td>{this.props.data.distance_kms}</td>
                <td>{this.props.data.duration_hrs}</td>
                <td>{this.props.data.average_speed}</td>
                <td>
                    <EditJogElement
                        data={this.props.data}
                        onJogEditSubmit={this.props.onJogEditSubmit}
                    />
                    <i className="icon ion-close-circled margin-left-5" data-id={this.props.data.jog_id} onClick={this.props.jogDelete}></i>
                </td>
            </tr>
        );
    }
}

class JogFilter extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            user_id: this.props.user_id,
            from_date: '',
            to_date: '',
        };

        this.handleFromDateChange = this._handleFromDateChange.bind(this);
        this.handleToDateChange = this._handleToDateChange.bind(this);
        this.handleFilterSubmit = this._handleFilterSubmit.bind(this);
    }

    _handleFromDateChange(e) {
        this.setState({from_date: e});
    }

    _handleToDateChange(e) {
        this.setState({to_date: e});
    }

    _handleFilterSubmit(e) {
        e.preventDefault();
        let user_id = this.state.user_id;
        let from_date_obj = this.state.from_date;
        let to_date_obj = this.state.to_date;
        if(!this.state.from_date) {
            Alert.error('Please enter From Date', {position: 'bottom-left'});
            return;
        }
        if(!this.state.to_date) {
            Alert.error('Please enter To Date', {position: 'bottom-left'});
            return;
        }
        if (from_date_obj > to_date_obj) {
            Alert.error('From Date cannot be after To Date', {position: 'bottom-left'});
            return;
        }
        let from_date = `${from_date_obj.get('year')}-${from_date_obj.get('month')+1}-${from_date_obj.get('date')}`;
        let to_date = `${to_date_obj.get('year')}-${to_date_obj.get('month')+1}-${to_date_obj.get('date')}`;
        this.props.filterJogs({user_id, from_date, to_date});
    }

    render() {
        return (
            <form className="jog-form" onSubmit={this.handleFilterSubmit}>
                <div className="input-field">
                    <label> From Date </label>
                    <DatePicker
                        dateFormat='MMMM D, YYYY'
                        selected={this.state.from_date}
                        onChange={this.handleFromDateChange}
                    />
                </div>
                <div className="input-field">
                    <label> To Date </label>
                    <DatePicker
                        dateFormat='MMMM D, YYYY'
                        selected={this.state.to_date}
                        onChange={this.handleToDateChange}
                    />
                </div>
                <input type="submit" value="Filter" />
            </form>
        );
    }
}

class JogTable extends React.Component {

    constructor() {
        super();

        this.state = {
            jogList: [],
        };

        this.loadJogsFromServer = this._loadJogsFromServer.bind(this);
        this.filterJogs = this._filterJogs.bind(this);
        this.handleJogSubmit = this._handleJogSubmit.bind(this);
        this.handleJogDelete = this._handleJogDelete.bind(this);
        this.handleJogEditSubmit = this._handleJogEditSubmit.bind(this);
    }

    _handleJogSubmit(jog) {
        jog['csrfmiddlewaretoken'] = getCookie('csrftoken');
        console.log(jog);
        jQuery.ajax({
            url: this.props.postUrl,
            dataType: 'json',
            type: 'POST',
            data: jog,
            success: function(jogList) {
                Alert.success('Jog entry added', {position: 'bottom-left'});
                this.loadJogsFromServer();
            }.bind(this),
            error: function(xhr, status, err) {
                Alert.error('Please try again later', {position: 'bottom-left'});
                console.error(this.props.postUrl, status, err.toString());
            }.bind(this)
        });
    }

    _handleJogDelete(e) {
        let jog_id = e.target.getAttribute('data-id');
        jQuery.ajax({
            url: `/jog/${jog_id}/`,
            dataType: 'json',
            type: 'DELETE',
            beforeSend: function(xhr) {
                xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
            }.bind(this),
            success: function(jogList) {
                Alert.success('Jog entry deleted', {position: 'bottom-left'});
                this.loadJogsFromServer();
            }.bind(this),
            error: function(xhr, status, err) {
                Alert.error('Please try again later', {position: 'bottom-left'});
                console.error(this.props.postUrl, status, err.toString());
            }.bind(this)
        });
    }

    _handleJogEditSubmit(jog) {
        console.log(jog);
        jQuery.ajax({
            url: `/jog/${jog.jog_id}/`,
            dataType: 'json',
            type: 'PUT',
            data: jog,
            beforeSend: function(xhr) {
                xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
            }.bind(this),
            success: function(jogList) {
                Alert.success('Jog entry updated', {position: 'bottom-left'});
                this.loadJogsFromServer();
            }.bind(this),
            error: function(xhr, status, err) {
                Alert.error('Please try again later', {position: 'bottom-left'});
                console.error(this.props.postUrl, status, err.toString());
            }.bind(this)
        });
    }

    _loadJogsFromServer() {
        jQuery.ajax({
            url: this.props.getUrl,
            dataType: 'json',
            cache: false,
            success: function(jogList) {
                this.setState(jogList);
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.getUrl, status, err.toString());
            }.bind(this)
        });
    }

    _filterJogs(data) {
        data['csrfmiddlewaretoken'] = getCookie('csrftoken');
        jQuery.ajax({
            url: this.props.getUrl,
            dataType: 'json',
            type: 'POST',
            data: data,
            cache: false,
            success: function(jogList) {
                this.setState(jogList);
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.getUrl, status, err.toString());
            }.bind(this)
        });
    }

    componentDidMount() {
        this.loadJogsFromServer();
    }

    render() {
        let jogList = this.state.jogList.map((jog) => (
            <JogElement
                key={jog.jog_id}
                showUsername={this.props.showUsername}
                jogDelete={this.handleJogDelete}
                onJogEditSubmit={this.handleJogEditSubmit}
                data={jog}
            />
        ));
        return (
            <div className="jog-list-and-form">
                <JogEntryForm
                    edit={false}
                    showUsername={this.props.showUsername}
                    onJogSubmit={this.handleJogSubmit}
                    onJogEditSubmit={this.handleJogEditSubmit}
                    user_id={this.props.user_id}
                    username=''
                    timestamp={moment()}
                    distance=''
                    duration={30}
                />
                <JogFilter filterJogs={this.filterJogs} />
                <table>
                    <thead>
                        <tr>
                            {this.props.showUsername && <th>Username</th>}
                            <th>Date</th>
                            <th>Distance</th>
                            <th>Duration</th>
                            <th>Average Speed</th>
                            <th> </th>
                        </tr>
                    </thead>
                    <tbody>
                        {jogList}
                    </tbody>
                </table>
                {this.state.jogList.length === 0 ?
                    <div className="empty-table"> Your list is empty. Start adding using the form above!</div>
                    :
                    <div className="empty-table"> Total Distance: <b>{this.state.totalDistance}</b>, Time Taken: <b>{this.state.totalTimeTaken}</b>, Average Speed: <b>{this.state.overallAverageSpeed}</b></div>
                }
            </div>
        );
    }
}


class JogEntryForm extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            editing: this.props.edit,
            user_id: this.props.user_id,
            username: this.props.username,
            timestamp: this.props.timestamp,
            distance: this.props.distance,
            duration: this.props.duration
        };

        this.getUserList = this._getUserList.bind(this);
        this.handleUsernameChange = this._handleUsernameChange.bind(this);
        this.handleTimestampChange = this._handleTimestampChange.bind(this);
        this.handleDistanceChange = this._handleDistanceChange.bind(this);
        this.handleDurationChange = this._handleDurationChange.bind(this);
        this.handleSubmit = this._handleSubmit.bind(this);
        this.handleEditSubmit = this._handleEditSubmit.bind(this);
        this.formatDurationLabel = this._formatDurationLabel.bind(this);
    }

    _getUserList() {
        jQuery.ajax({
            url: '/get-user-list/',
            dataType: 'json',
            cache: false,
            success: function(userData) {
                let userList = Object.keys(userData).map(function(key){
                    return userData[key].username;
                });
                let usernameToID = {};
                for (let key in userData){
                    usernameToID[userData[key].username] = key;
                }
                this.setState({userList, userData, usernameToID});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error('/get-user-list/', status, err.toString());
            }.bind(this)
        });
    }

    componentDidMount() {
        this.getUserList();
    }

    _handleUsernameChange(e) {
        let selected_username = e.value;
        let user_id = this.state.usernameToID[selected_username];
        this.setState({username: selected_username, user_id: user_id});
    }

    _handleTimestampChange(e) {
        this.setState({timestamp: e});
    }

    _handleDistanceChange(e) {
        this.setState({distance: e.target.value});
    }

    _handleDurationChange(e) {
        this.setState({duration: e});
    }

    _formatDurationLabel(e) {
        let mins = e % 60;
        let hours = Math.floor(e / 60);
        if(hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${e} mins`;
    }

    _handleEditSubmit(e) {
        e.preventDefault();
        let user_id = this.state.user_id;
        let timestamp_obj = this.state.timestamp;
        // We expect distance in meters in backend
        let distance = this.state.distance*1000;
        // Duration is minutes right now, we expect in seconds
        let duration = this.state.duration*60;
        let jog_id = this.props.jog_id;
        if (!timestamp_obj) {
            Alert.error('Please choose a date', {position: 'bottom-left'});
            return;
        }
        if (!distance) {
            Alert.error('Please enter the distance covered', {position: 'bottom-left'});
            return;
        }
        if (!duration) {
            return;
        }
        let timestamp = `${timestamp_obj.get('year')}-${timestamp_obj.get('month')+1}-${timestamp_obj.get('date')}T${timestamp_obj.get('hour')}:${timestamp_obj.get('minute')}`;
        this.props.onJogEditSubmit({jog_id, user_id, timestamp, distance, duration});
        this.props.closeModal();
    }

    _handleSubmit(e) {
        e.preventDefault();
        let user_id = this.state.user_id;
        let timestamp_obj = this.state.timestamp;
        // We expect distance in meters in backend
        let distance = this.state.distance*1000;
        // Duration is minutes right now, we expect in seconds
        let duration = this.state.duration*60;
        if (!timestamp_obj) {
            Alert.error('Please choose a date', {position: 'bottom-left'});
            return;
        }
        if (!distance) {
            Alert.error('Please enter the distance covered', {position: 'bottom-left'});
            return;
        }
        if (!duration) {
            return;
        }
        let timestamp = `${timestamp_obj.get('year')}-${timestamp_obj.get('month')+1}-${timestamp_obj.get('date')}T${timestamp_obj.get('hour')}:${timestamp_obj.get('minute')}`;
        this.props.onJogSubmit({user_id, timestamp, distance, duration});
        this.setState({distance: '', duration: 30});
    }

    render() {
        if(this.state.userList === undefined) { // Don't do !this.state.userList because userList can be empty
            return null;
        }
        let options = this.state.userList.map(function(uname) {
            return {label: uname, value: uname}
        });
        return (
            <form className="jog-form" onSubmit={this.state.editing ? this.handleEditSubmit : this.handleSubmit}>
                {this.props.showUsername &&
                <div className="input-field">
                    <label> Username </label>
                    <SimpleSelect
                        options={options}
                        onValueChange={this.handleUsernameChange}
                        placeholder="Select a user">
                    </SimpleSelect>
                </div>
                }
                <div className="input-field">
                    <label> Jogging Date </label>
                    <DatePicker
                        dateFormat='MMMM D, YYYY'
                        selected={this.state.timestamp}
                        onChange={this.handleTimestampChange}
                    />
                </div>
                <div className="input-field">
                    <label> Distance covered (km) </label>
                    <input
                        type="number"
                        value={this.state.distance}
                        onChange={this.handleDistanceChange}
                    />
                </div>
                <div className="input-field-100">
                    <label> Time taken </label>
                    <InputRange
                        formatLabel={this.formatDurationLabel}
                        maxValue={720}
                        minValue={1}
                        value={this.state.duration}
                        onChange={this.handleDurationChange}
                    />
                </div>
                {this.state.editing ? <div> <input type="submit" value="Update" /> <a onClick={this.props.closeModal}> Cancel </a></div> : <input type="submit" value="Save" />}
            </form>
        );
    }
}
