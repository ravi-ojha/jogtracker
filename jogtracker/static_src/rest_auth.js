import React from 'react';
import ReactDOM from 'react-dom';
import jQuery from 'jquery';
import Alert from 'react-s-alert';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import randomstring from 'randomstring';

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
            success: function() {
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

    _loadUsersFromServer() {
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
                let emailList = Object.keys(userData).map(function(key){
                    return userData[key].email;
                });
                this.setState({userList, userData, usernameToID, emailList});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error('/get-user-list/', status, err.toString());
            }.bind(this)
        });
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
            success: function() {
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


class EditUserElement extends React.Component {
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
        return (
            <i className="icon ion-edit" data-id={this.props.user_id} onClick={this.handleClick}>
            {
                this.state.isShowingModal &&
                <ModalContainer>
                  <ModalDialog>
                    <UserEntryForm
                        edit={true}
                        user_id={this.props.user_id}
                        onUserEditSubmit={this.props.onUserEditSubmit}
                        username={this.props.data.username}
                        email={this.props.data.email}
                        userList={this.props.userList}
                        emailList={this.props.emailList}
                        closeModal={this.handleClose}
                    />
                  </ModalDialog>
                </ModalContainer>
            }
            </i>
        );
    }
}



class UserElement extends React.Component {
    render() {
        return (
            <tr>
                <td>{this.props.data.username}</td>
                <td>{this.props.data.email}</td>
                <td>
                    <EditUserElement
                        data={this.props.data}
                        user_id={this.props.user_id}
                        onUserEditSubmit={this.props.onUserEditSubmit}
                        userList={this.props.userList}
                        emailList={this.props.emailList}
                    />
                    <i className="icon ion-close-circled margin-left-5" data-id={this.props.user_id} onClick={this.props.userDelete}></i>
                </td>
            </tr>
        );
    }
}


class UserTable extends React.Component {

    constructor() {
        super();

        this.state = {
            userList: [],
        };

        this.loadUsersFromServer = this._loadUsersFromServer.bind(this);
        this.handleUserSubmit = this._handleUserSubmit.bind(this);
        this.handleUserDelete = this._handleUserDelete.bind(this);
        this.handleUserEditSubmit = this._handleUserEditSubmit.bind(this);
    }

    _handleUserSubmit(user) {
        user['csrfmiddlewaretoken'] = getCookie('csrftoken');
        jQuery.ajax({
            url: '/rest-auth/registration/',
            dataType: 'json',
            type: 'POST',
            data: user,
            success: function(userList) {
                Alert.success('User entry added', {position: 'bottom-left'});
                this.loadUsersFromServer();
            }.bind(this),
            error: function(xhr, status, err) {
                Alert.error('Please try again later', {position: 'bottom-left'});
            }.bind(this)
        });
    }

    _handleUserDelete(e) {
        let user_id = e.target.getAttribute('data-id');
        jQuery.ajax({
            url: `/delete-user/${user_id}/`,
            dataType: 'json',
            type: 'DELETE',
            beforeSend: function(xhr) {
                xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
            }.bind(this),
            success: function(response) {
                if(response.success) {
                    Alert.success(response.message, {position: 'bottom-left'});
                } else {
                    Alert.error(response.message, {position: 'bottom-left'});
                }
                this.loadUsersFromServer();
            }.bind(this),
            error: function(xhr, status, err) {
                Alert.error('Please try again later', {position: 'bottom-left'});
                console.error(this.props.postUrl, status, err.toString());
            }.bind(this)
        });
    }

    _handleUserEditSubmit(data) {
        console.log(data);
        jQuery.ajax({
            url: `/update-user/${data.user_id}/`,
            dataType: 'json',
            type: 'POST',
            data: data,
            beforeSend: function(xhr) {
                xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
            }.bind(this),
            success: function(response) {
                if(response.success) {
                    Alert.success(response.message, {position: 'bottom-left'});
                } else {
                    Alert.error(response.message, {position: 'bottom-left'});
                }
                this.loadUsersFromServer();
            }.bind(this),
            error: function(xhr, status, err) {
                Alert.error('Please try again later', {position: 'bottom-left'});
                console.error('update-user', status, err.toString());
            }.bind(this)
        });
    }

    _loadUsersFromServer() {
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
                let emailList = Object.keys(userData).map(function(key){
                    return userData[key].email;
                });
                this.setState({userList, userData, usernameToID, emailList});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error('/get-user-list/', status, err.toString());
            }.bind(this)
        });
    }

    componentDidMount() {
        this.loadUsersFromServer();
    }

    render() {
        let this_1 = this;
        if(this.state.userData === undefined) {
            return null;
        }
        let userTable = Object.keys(this.state.userData).map(function(user_id) {
            return <UserElement
                key={user_id}
                userDelete={this_1.handleUserDelete}
                onUserEditSubmit={this_1.handleUserEditSubmit}
                data={this_1.state.userData[user_id]}
                user_id={user_id}
                userList={this_1.state.userList}
                emailList={this_1.state.emailList}
            />
        });
        return (
            <div className="jog-list-and-form">
                <UserEntryForm
                    edit={false}
                    onUserSubmit={this.handleUserSubmit}
                    onUserEditSubmit={this.handleUserEditSubmit}
                    username=''
                    email=''
                    userList={this.state.userList}
                    emailList={this.state.emailList}
                />
                <table>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th> </th>
                        </tr>
                    </thead>
                    <tbody>
                        {userTable}
                    </tbody>
                </table>
                {userTable.length === 0 && <div className="empty-table"> There are no users. Add users using the above form!</div>}
            </div>
        );
    }
}


class UserEntryForm extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            editing: this.props.edit,
            user_id: this.props.user_id,
            username: this.props.username,
            email: this.props.email,
            userList: this.props.userList,
            emailList: this.props.emailList,
        };

        this.handleUsernameChange = this._handleUsernameChange.bind(this);
        this.handleEmailChange = this._handleEmailChange.bind(this);
        this.handleSubmit = this._handleSubmit.bind(this);
        this.handleEditSubmit = this._handleEditSubmit.bind(this);
    }

    _handleUsernameChange(e) {
        this.setState({username: e.target.value});
    }

    _handleEmailChange(e) {
        this.setState({email: e.target.value});
    }

    _handleEditSubmit(e) {
        e.preventDefault();
        let user_id = this.state.user_id;
        let username = this.state.username;
        let email = this.state.email;
        if (!username) {
            Alert.error('Please enter username', {position: 'bottom-left'});
            return;
        }
        if (!email) {
            Alert.error('Please enter email address', {position: 'bottom-left'});
            return;
        }
        if(this.state.userList.indexOf(username) >= 0) {
            Alert.error('That username is already taken', {position: 'bottom-left'});
            return;
        }
        if(this.state.emailList.indexOf(email) >= 0) {
            Alert.error('That email is already registered', {position: 'bottom-left'});
            return;
        }
        this.props.onUserEditSubmit({user_id, username, email});
        this.props.closeModal();
    }

    _handleSubmit(e) {
        e.preventDefault();
        let username = this.state.username;
        let email = this.state.email;

        if (!username) {
            Alert.error('Please enter username', {position: 'bottom-left'});
            return;
        }
        if (!email) {
            Alert.error('Please enter email address', {position: 'bottom-left'});
            return;
        }
        if(this.state.userList.indexOf(username) >= 0) {
            Alert.error('That username is already taken', {position: 'bottom-left'});
            return;
        }
        if(this.state.emailList.indexOf(email) >= 0) {
            Alert.error('That email is already registered', {position: 'bottom-left'});
            return;
        }
        let password1 = randomstring.generate(8);
        let password2 = password1;
        this.props.onUserSubmit({username, email, password1, password2});
        this.setState({username: '', email: ''});
    }

    render() {
        if(this.state.userList === undefined) { // Don't do !this.state.userList because userList can be empty
            return null;
        }
        return (
            <form className="jog-form" onSubmit={this.state.editing ? this.handleEditSubmit : this.handleSubmit}>

                <div className="input-field">
                    <label> Username </label>
                    <input
                        type="text"
                        value={this.state.username}
                        onChange={this.handleUsernameChange}
                        placeholder="Username"
                    />
                </div>
                <div className="input-field">
                    <label> Email </label>
                    <input
                        type="text"
                        value={this.state.email}
                        onChange={this.handleEmailChange}
                        placeholder="Email address"
                    />
                </div>
                {this.state.editing ? <div> <input type="submit" value="Update" /> <a onClick={this.props.closeModal}> Cancel </a></div> : <input type="submit" value="Save" />}
            </form>
        );
    }
}


module.exports = {
    RegisterForm: RegisterForm,
    SignupModal: SignupModal,
    LoginForm: LoginForm,
    UserTable: UserTable
}
