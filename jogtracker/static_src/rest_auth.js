import React from 'react';
import ReactDOM from 'react-dom';
import jQuery from 'jquery';
import Alert from 'react-s-alert';

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

class SignupModal extends React.Component {
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
            <a className="button" onClick={this.handleClick}>
            {
                this.state.isShowingModal &&
                <ModalContainer>
                  <ModalDialog>
                    <RegisterForm
                        closeModal={this.handleClose}
                    />
                  </ModalDialog>
                </ModalContainer>
            }
            </a>
        );
    }
}

class RegisterForm extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            email: '',
            username: '',
            password1: '',
            password2: '',
        };

        this.handleEmailChange = this._handleEmailChange.bind(this);
        this.handleUsernameChange = this._handleUsernameChange.bind(this);
        this.handlePassword1Change = this._handlePassword1Change.bind(this);
        this.handlePassword2Change = this._handlePassword2Change.bind(this);
        this.handleSubmit = this._handleSubmit.bind(this);
        this.submitRegisterForm = this._submitRegisterForm.bind(this);
    }

    _handleEmailChange(e) {
        this.setState({email: e.target.value});
    }

    _handleUsernameChange(e) {
        this.setState({username: e.target.value});
    }

    _handlePassword1Change(e) {
        this.setState({password1: e.target.value});
    }

    _handlePassword2Change(e) {
        this.setState({password2: e.target.value});
    }

    _submitRegisterForm(data) {
        data['csrfmiddlewaretoken'] = getCookie('csrftoken');
        console.log(data);
        jQuery.ajax({
            url: '/rest-auth/registration/',
            dataType: 'json',
            type: 'POST',
            data: data,
            success: function(jogList) {
                this.props.getUserInfo();
            }.bind(this),
            error: function(xhr, status, err) {
                Alert.error('Please try again later', {position: 'bottom-left'});
                console.error(this.props.postUrl, status, err.toString());
            }.bind(this)
        });
    }

    validateEmail(email) {
        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    validatePassword(password1, password2) {
        if(password1.length < 6) {
            Alert.error('Please enter at least 6 characters in password', {position: 'bottom-left'});
            return false;
        }
        if(password1 !== password2) {
            Alert.error('Password and Confirm Password should match', {position: 'bottom-left'});
            return false;
        }
        return true;
    }

    _handleSubmit(e) {
        e.preventDefault();
        let email = this.state.email;
        let username = this.state.username;
        let password1 = this.state.password1;
        let password2 = this.state.password2;
        if (!email) {
            Alert.error('Please enter email address', {position: 'bottom-left'});
            return;
        }
        if (!username) {
            Alert.error('Please enter username', {position: 'bottom-left'});
            return;
        }
        if (!this.validateEmail(email)) {
            Alert.error('Please enter a valid email address', {position: 'bottom-left'});
            return;
        }
        if (!password1) {
            Alert.error('Please enter password', {position: 'bottom-left'});
            return;
        }
        if (!password2) {
            Alert.error('Please enter confirm password', {position: 'bottom-left'});
            return;
        }
        if (!this.validatePassword(password1, password2)) {
            return;
        }
        this.submitRegisterForm({email, username, password1, password2});
        this.setState({email: '', username: '', password1: '', password2: ''});
    }

    render() {
        return (
            <form className="signup-form" onSubmit={this.state.editing ? this.handleEditSubmit : this.handleSubmit}>
                <div className="input-field">
                    <label> Email </label>
                    <input
                        type="text"
                        placeholder="Email"
                        value={this.state.email}
                        onChange={this.handleEmailChange}
                    />
                </div>
                <div className="input-field">
                    <label> Username </label>
                    <input
                        type="text"
                        placeholder="Username"
                        value={this.state.username}
                        onChange={this.handleUsernameChange}
                    />
                </div>
                <div className="input-field-100">
                    <label> Password </label>
                    <input
                        type="password"
                        placeholder="Password"
                        value={this.state.password1}
                        onChange={this.handlePassword1Change}
                    />
                </div>
                <div className="input-field-100">
                    <label> Confirm Password </label>
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={this.state.password2}
                        onChange={this.handlePassword2Change}
                    />
                </div>
                <div> <input type="submit" value="Register" /> { this.props.closeModal && <a onClick={this.props.closeModal}> Cancel </a>}</div>
            </form>
        );
    }
}

class LoginForm extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            username: '',
            password: '',
        };

        this.handleUsernameChange = this._handleUsernameChange.bind(this);
        this.handlePasswordChange = this._handlePasswordChange.bind(this);
        this.handleSubmit = this._handleSubmit.bind(this);
        this.submitLoginForm = this._submitLoginForm.bind(this);
    }

    _handleUsernameChange(e) {
        this.setState({username: e.target.value});
    }

    _handlePasswordChange(e) {
        this.setState({password: e.target.value});
    }

    _submitLoginForm(data) {
        data['csrfmiddlewaretoken'] = getCookie('csrftoken');
        console.log(data);
        jQuery.ajax({
            url: '/rest-auth/login/',
            dataType: 'json',
            type: 'POST',
            data: data,
            success: function(jogList) {
                this.props.getUserInfo();
            }.bind(this),
            error: function(xhr, status, err) {
                Alert.error('Please try again later', {position: 'bottom-left'});
                console.error(this.props.postUrl, status, err.toString());
            }.bind(this)
        });
    }

    _handleSubmit(e) {
        e.preventDefault();

        let username = this.state.username;
        let password = this.state.password;

        if (!username) {
            Alert.error('Please enter username', {position: 'bottom-left'});
            return;
        }

        if (!password) {
            Alert.error('Please enter password', {position: 'bottom-left'});
            return;
        }

        this.submitLoginForm({username, password});
        this.setState({username: '', password: ''});
    }

    render() {
        return (
            <form className="signup-form" onSubmit={this.state.editing ? this.handleEditSubmit : this.handleSubmit}>
                <div className="input-field">
                    <label> Username </label>
                    <input
                        type="text"
                        placeholder="Username"
                        value={this.state.username}
                        onChange={this.handleUsernameChange}
                    />
                </div>
                <div className="input-field-100">
                    <label> Password </label>
                    <input
                        type="password"
                        placeholder="Password"
                        value={this.state.password}
                        onChange={this.handlePasswordChange}
                    />
                </div>
                <div> <input type="submit" value="Login" /> { this.props.closeModal && <a onClick={this.props.closeModal}> Cancel </a>}</div>
            </form>
        );
    }
}


module.exports = {
    RegisterForm: RegisterForm,
    SignupModal: SignupModal,
    LoginForm: LoginForm
}
