var React = require('react');
var DefaultLayout = require('./default');

class LoggedOutPage extends React.Component {
    render() {
        return (
            <DefaultLayout>
                <div>
                    You have been logged out &nbsp;
                    <a href={this.props.url}>Sign-in here</a>
                </div>
            </DefaultLayout>
        );
    }
}

module.exports = LoggedOutPage;