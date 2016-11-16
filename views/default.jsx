var React = require('react');

class DefaultLayout extends React.Component {
    render() {
        return (
            <html>
                <head>
                    <title>Azure</title>
                </head>
                <body>{this.props.children}</body>
            </html>
        );
    }
}

module.exports = DefaultLayout;