import React from 'react';
import ReactDOM from 'react-dom';
import jQuery from 'jquery';


export class CommentSection extends React.Component {

    constructor() {
        super();

        this.state = {
            comments: []
        };

        this.handleCommentSubmit = this._handleCommentSubmit.bind(this);
    }

    _handleCommentSubmit(comment) {
        jQuery.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'POST',
            data: comment,
            success: function(comments) {
                this.setState({comments});
            }.bind(this),
            error: function(xhr, status, err) {
                this.setState({comments});
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    }

    render() {

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
                        <JogTable url='/user-jogs/1/' />
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
        // this.handleCommentSubmit = this._handleCommentSubmit.bind(this);
    }

    _loadJogsFromServer() {
        jQuery.ajax({
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: function(jogList) {
                this.setState({jogList});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
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
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Duration</th>
                        <th>Distance</th>
                        <th>Average Speed</th>
                    </tr>
                </thead>
                <tbody>
                    {jogList}
                </tbody>
            </table>
        );
    }
}


class CommentForm extends React.Component {

    constructor() {
        super();

        this.state = {
            author: '',
            text: ''
        };

        this.handleAuthorChange = this._handleAuthorChange.bind(this);
        this.handleTextChange = this._handleTextChange.bind(this);
        this.handleSubmit = this._handleSubmit.bind(this);
    }

    _handleAuthorChange(e) {
        this.setState({author: e.target.value});
    }

    _handleTextChange(e) {
        this.setState({text: e.target.value});
    }

    _handleSubmit(e) {
        e.preventDefault();
        let author = this.state.author.trim();
        let text = this.state.text.trim();
        if (!text || !author) {
            return;
        }
        this.props.onCommentSubmit({author, text});
        this.setState({author: '', text: ''});
    }

    render() {
        return (
            <form className="commentForm" onSubmit={this.handleSubmit}>
                <input
                    type="text"
                    placeholder="Your name"
                    value={this.state.author}
                    onChange={this.handleAuthorChange}
                />
                <input
                    type="text"
                    placeholder="Say something..."
                    value={this.state.text}
                    onChange={this.handleTextChange}
                />
                <input type="submit" value="Post" />
            </form>
        );
    }
}
