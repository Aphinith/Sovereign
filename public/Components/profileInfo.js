import React, {Component} from 'react'
var axios = require('axios');
 
// shows ProfileInfo
class ProfileInfo extends Component {
  constructor(props){
    super(props)
    
  }


  render() {
    return (
      <aside className="account-information">
        <h3>Account Information</h3>
        <p>Username: {this.props.userInfo.userName}</p>
        <p>First Name: {this.props.userInfo.firstName}</p>
        <p>Last Name: {this.props.userInfo.email}</p>
        <p>Phonenumber: {this.props.userInfo.phoneNumber}</p>
        <p>Company Name:{this.props.userInfo.companyName}</p>
        <p>Website: {this.props.userInfo.website}</p>
      </aside>
    )
  }
}

export default ProfileInfo