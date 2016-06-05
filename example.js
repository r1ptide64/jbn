//console.log('start.');
//var jbTimer = setInterval(jbFn, 10 * 1000);
//
//function jbFn() {
//    console.log('timer went off!');
//    clearInterval(jbTimer);
//}
var Client = require('castv2').Client;
var mdns = require('mdns');
var sequence = [
    mdns.rst.DNSServiceResolve(),
    'DNSServiceGetAddrInfo' in mdns.dns_sd ? mdns.rst.DNSServiceGetAddrInfo() : mdns.rst.getaddrinfo({
        families: [4]
    }),
    mdns.rst.makeAddressesUnique()
];
var browser = mdns.createBrowser(mdns.tcp('googlecast'), {
    resolverSequence: sequence
});

browser.on('serviceUp', function (service) {

    ondeviceup(service); //service.addresses[0]);
    browser.stop();
});

browser.start();

function ondeviceup(hostService) {
    console.log('found device %s at %s:%d', hostService.name, hostService.addresses[0], hostService.port);
    var host = hostService.addresses[0];
    var client = new Client();
    client.connect(host, function () {
        // create various namespace handlers
        var connection = client.createChannel('sender-0', 'receiver-0', 'urn:x-cast:com.google.cast.tp.connection', 'JSON');
        var heartbeat = client.createChannel('sender-0', 'receiver-0', 'urn:x-cast:com.google.cast.tp.heartbeat', 'JSON');
        var receiver = client.createChannel('sender-0', 'receiver-0', 'urn:x-cast:com.google.cast.receiver', 'JSON');
        var media = client.createChannel('sender-0', 'receiver-0', 'urn:x-cast:com.google.cast.media', 'JSON');
        var sID;

        // establish virtual connection to the receiver
        connection.send({
            type: 'CONNECT'
        });

        // start heartbeating
        setInterval(function () {
            heartbeat.send({
                type: 'PING'
            });
        }, 5000);

        //        setInterval(function() {
        //            media.send()
        //        }, 5000);

        //        // launch YouTube app
        //        receiver.send({
        //            type: 'LAUNCH',
        //            appId: 'YouTube',
        //            requestId: 1
        //        });
        setInterval(function () {
            receiver.send({
                type: 'GET_STATUS',
                requestId: 1
            });
        }, 3000);
        //display receiver status updates
        receiver.on('message', function (data, broadcast) {
            //            console.log(data.payload_utf8);
            //            if (data.type = 'RECEIVER_STATUS') {
            console.log(data.status.applications[0].namespaces);
            //            console.log(JSON.parse(data));
            //            }
        });
    });

}