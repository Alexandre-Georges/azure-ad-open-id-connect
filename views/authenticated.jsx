var React = require('react');
var DefaultLayout = require('./default');

class AuthenticatedPage extends React.Component {
    render () {
        return (
            <DefaultLayout>
                <div>
                    You are authenticated
                    <br/>
                    <br/>
                    Your ID token is {this.props.idToken}
                    <br/>
                    <br/>
                    JWT header {this.props.jwt.header}
                    <br/>
                    JWT payload {this.props.jwt.payload}
                    <br/>
                    JWT signature {this.props.jwt.signature}
                    <br/>
                    <br/>
                    <br/>
                    <a href="/logout">Logout here</a>
                    <br/>
                    <br/>
                    <form method="POST" action="/validateToken">
                        ID Token validation <input type="text" name="token" value={this.props.idToken} />&nbsp;<input type="submit" value="Validate" />
                    </form>
                    <br/>
                    <br/>
                    Validation result {this.props.validation}
                </div>
            </DefaultLayout>
        );
    }
}

module.exports = AuthenticatedPage;