define(function(require) {
	var ws = null,
		enums = require('enums'),
		pubsub = require('pubsub'),
		isBrowserSupported = function() {
			return 'WebSocket' in window;
		},
		connect = function() {
			if (isBrowserSupported()) {
				ws = new WebSocket('ws://localhost:9000');

				if (ws !== null) {
					ws.onopen = function() {
						pubsub.publish('network-connected');
					};

					ws.onclose = function(e) {
						ws = null;
						pubsub.publish('network-disconnected');
					};

					ws.onmessage = function(e) {
						var data, data_length, i, command;

						try {
							data = JSON.parse(e.data);
							data_length = data.length;
							for (i = 0; i < data_length; i++) {
								command = data[i];
								command[0] = 'server-' + enums.CommandsToClient[command[0]];
								pubsub.publish.apply(null, command);
							}
						} catch (e) {}
					};
				}
			}
		},
		sendMessage = function() {
			if (ws !== null) {
				ws.send(JSON.stringify(Array.prototype.slice.call(arguments, 0)));
			}
		};

	return {
		isBrowserSupported: isBrowserSupported,
		connect: connect,
		sendMessage: sendMessage
	};
});
