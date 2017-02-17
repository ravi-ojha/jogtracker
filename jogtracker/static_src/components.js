import React from 'react';
import ReactDOM from 'react-dom';
import jQuery from 'jquery';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import InputRange from 'react-input-range';


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
var csrftoken = getCookie('csrftoken');

export class CommentSection extends React.Component {

    constructor() {
        super();

        this.state = {

        };
    }

    render() {
        let getUrl = `/user-jogs/${this.props.user_id}/`;
        let postUrl = `/jog/`;
        return (
            <div className="main-root-div">
                <nav className="navigation">
                    <section className="container">
                        <a className="navigation-title" href="#">
                            <h1 className="title">Jog Tracker</h1>
                        </a>
                        <ul className="navigation-list float-right">
                            <li className="navigation-item">
                                <a className="navigation-link" href="#my-jogs">My Jogs</a>
                            </li>
                            <li className="navigation-item">
                                <a className="navigation-link" href="#manage-users">Manage Users</a>
                            </li>
                            <li className="navigation-item">
                                <a className="navigation-link" href="#manage-app-data">Manage App Data</a>
                            </li>
                        </ul>
                    </section>
                </nav>
                <div className="header">
                    <section className="header-container">
                        <h1> Welcome to Jog Tracker!</h1>
                        <p> Helps you track your jogging activities and analyze stats </p>
                    </section>
                </div>
                <div className="body">
                    <div className="jog-list">
                        <JogTable getUrl={getUrl} postUrl={postUrl} user_id={this.props.user_id}/>
                    </div>
                </div>
            </div>
        );
    }
}


class JogElement extends React.Component {
    render() {
        return (
            <tr>
                <td>{this.props.timestamp}</td>
                <td>{this.props.distance_kms}</td>
                <td>{this.props.duration_hrs}</td>
                <td>{this.props.average_speed}</td>
            </tr>
        );
    }
}

class JogTable extends React.Component {

    constructor() {
        super();

        this.state = {
            jogList: []
        };

        this.loadJogsFromServer = this._loadJogsFromServer.bind(this);
        this.handleJogSubmit = this._handleJogSubmit.bind(this);
    }

    _handleJogSubmit(jog) {
        jog['csrfmiddlewaretoken'] = csrftoken;
        console.log(jog);
        jQuery.ajax({
            url: this.props.postUrl,
            dataType: 'json',
            type: 'POST',
            data: jog,
            success: function(jogList) {
                this.loadJogsFromServer();
            }.bind(this),
            error: function(xhr, status, err) {
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
                this.setState({jogList});
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
        if(this.state.jogList.length === 0) {
            return null;
        }
        let jogList = this.state.jogList.map((jog) => (
            <JogElement
                timestamp={jog.timestamp}
                distance_kms={jog.distance_kms}
                duration_hrs={jog.duration_hrs}
                average_speed={jog.average_speed}
                key={jog.id} />
        ));
        return (
            <div className="jog-list-and-form">
                <JogEntryForm
                    onJogSubmit={this.handleJogSubmit}
                    user_id={this.props.user_id}
                    timestamp={moment()}
                    distance=''
                    duration={10}
                />
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Distance</th>
                            <th>Duration</th>
                            <th>Average Speed</th>
                        </tr>
                    </thead>
                    <tbody>
                        {jogList}
                    </tbody>
                </table>
            </div>
        );
    }
}


class JogEntryForm extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            user_id: this.props.user_id,
            timestamp: this.props.timestamp,
            distance: this.props.distance,
            duration: this.props.duration
        };

        this.handleTimestampChange = this._handleTimestampChange.bind(this);
        this.handleDistanceChange = this._handleDistanceChange.bind(this);
        this.handleDurationChange = this._handleDurationChange.bind(this);
        this.handleSubmit = this._handleSubmit.bind(this);
        this.formatDurationLabel = this._formatDurationLabel.bind(this);
    }

    _handleTimestampChange(e) {
        console.log(e);
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

    _handleSubmit(e) {
        e.preventDefault();
        let user_id = this.state.user_id;
        let timestamp_obj = this.state.timestamp;
        // We expect distance in meters in backend
        let distance = this.state.distance*1000;
        // Duration is minutes right now, we expect in seconds
        let duration = this.state.duration*60;
        if (!timestamp_obj) {
            return;
        }
        if (!distance) {
            return;
        }
        if (!duration) {
            return;
        }
        let timestamp = `${timestamp_obj.get('year')}-${timestamp_obj.get('month')+1}-${timestamp_obj.get('date')}T${timestamp_obj.get('hour')}:${timestamp_obj.get('minute')}`;
        this.props.onJogSubmit({user_id, timestamp, distance, duration});
        this.setState({distance: '', duration: 10});
    }

    render() {
        return (
            <form className="jog-form" onSubmit={this.handleSubmit}>
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
                <input type="submit" value="Save" />
            </form>
        );
    }
}
