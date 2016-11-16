var React = require('react');
var DefaultLayout = require('./default');

class NotAuthenticatedPage extends React.Component {
    render() {
        return (
            <DefaultLayout>
                <div>
                    You are not authenticated yet &nbsp;
                    <a href={this.props.url}>Sign-in here</a>
                </div>
            </DefaultLayout>
        );
    }
}

module.exports = NotAuthenticatedPage;