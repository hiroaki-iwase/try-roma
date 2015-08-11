//// cssConsole
//$('#input').cssConsole({
//	inputName:'console',
//	charLimit: 60,
//	onEnter: function(){
//		addLine("> "+$('#input').find('input').val());
//		execCommand($('#input').find('input').val());
//		$('#input').cssConsole('reset');	
//	}
//});
//
//var lineLimit = 28; //enable scroll
//var focus;
//
//focus = window.setInterval(function() {
//	if(!$('#input').find('input').is(":focus")){
//		$('#input').find('input').focus();
//	}
//}, 10);
//
//
//// toDO
//function addLine(input, style, color) {
//		if($('.console div').length==lineLimit) {
//			$('.console div').eq(0).remove();
//		}
//		style = typeof style !== 'undefined' ? style : 'line';
//		color = typeof color !== 'undefined' ? color : 'white';
//		$('.console').append('<div class="'+style+' '+color+'">'+input+'</div>');
//}
//
//
////todo 
//function execCommand(command){
//      return commands[command](); 
//}
//
//
//// todo
//var commands = {
//	help: function (){
//		addLine("Available command list:");
//		addLine("dir", 'margin');
//		addLine("help", 'margin');
//		addLine("ps", 'margin');
//	},
//	dir: function(){
//		addLine(".");
//		addLine("..");
//		addLine("Applications", 'margin', 'blue');
//		addLine("Documents", 'margin', 'blue');
//		addLine("Downloads", 'margin', 'blue');
//		addLine("Movies", 'margin', 'blue');
//	},
//	ps: function() {
//		addLine("Running processes:");
//		addLine("name: browser pid:8876", 'margin');
//		addLine("name: movie player pid:3213", 'margin');
//		addLine("name: system pid:0012", 'margin');
//	}
//}


// React


function clearHeader(){
    this.setState({greetingAA: ''})
    this.setState({greetingMessage: ''})
    this.setState({nonActiveNodelist: ''})
    this.setState({activeNodelist: ''})
}

function changeStyleToHash(json) {
    hash_str = json.replace(/", "/g,'"=>"').replace(/\]\[/g,', ').replace(/\[/,'{').replace(/\]/,'}');
    return hash_str;
}

function clearForm(){
    React.findDOMNode(this.refs.command).value = '';
}

function showResult(res) {
    var lastcmd = '> '+window.sessionStorage.getItem(['lastcmd'])

    value = this.state.result +'<br><br>'+ lastcmd + '<br>' + res;

    //console.log((value.match(/<br>/g)||[]).length);

    this.setState({result: value})
}

function refactorStatResult(res) {
    res_lines = '';
    for(var i in res){
        res_lines += (i +" "+ res[i]+"<br>");
    }
    return res_lines;
}

function sendQuery(action, data, url, format) {
    var path = url || '';
    $.ajax({
        url: "../"+path,
        type: action,
        data: data,
        dataType: format,
        cache: false,
    }).done(function(res){
        clearForm.bind(this)();
        if (action == 'PUT') {
          res = changeStyleToHash(res);
        } 
        if (format == 'json') {
            res = refactorStatResult(res);
        } 
        showResult.bind(this)(res);
    }.bind(this)).fail(function(){
        this.setState({result: 'API Request was failed '})
    }.bind(this));
}

function heardoc() {
    var heredoc = (function () {/*
 _ _ _       _  _                          _    _           _____  _____  __ __    _____  _____  _____  _____ 
| | | | ___ | || | ___  ___  _____  ___   | |_ | |_  ___   |_   _|| __  ||  |  |  | __  ||     ||     ||  _  |
| | | || -_|| || ||  _|| . ||     || -_|  |  _||   || -_|    | |  |    -||_   _|  |    -||  |  || | | ||     |
|_____||___||_||_||___||___||_|_|_||___|  |_|  |_|_||___|    |_|  |__|__|  |_|    |__|__||_____||_|_|_||__|__|
    */}).toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1];

    return heredoc;
}


function disabledForm() {
    React.findDOMNode(this.refs.command).disabled = 'true';
    React.findDOMNode(this.refs.command).placeholder = 'Please Reload';
}


function displayNodeDownMsg(cmd){

    if (cmd == 'shutdown_self') {
        var downMessage = this.state.nodeInfo.shift() + ' was down. So Try ROMA access the next node.'
        var activeMessage = "Active Nodes are " + this.state.nodeInfo
    }
console.log(cmd);
    if ((/^(balse|shutdown)$/.test(cmd)) || (this.state.nodeInfo.length == 0)) {
        var downMessage = 'All nodes were down!! So please Reload.'
        var activeMessage = ''
        disabledForm.bind(this)();
    }

    this.setState({nonActiveNodelist: downMessage})
    this.setState({activeNodelist: activeMessage})
}


var Test = React.createClass(
    {
        getInitialState() {
            return {
                greetingAA: heardoc(),
                greetingMessage: 'Please feel free to execute ROMA command!!',
                nonActiveNodelist: '',
                activeNodelist: '',
                nodeInfo: ['localhost_10001', 'localhost_10002', 'localhost_10003', 'localhost_10004', 'localhost_10005'],
                result: ""
            };
        },
        sendCommand(e) {
            var ENTER = 13;
            if(e.keyCode == ENTER){

                clearHeader.bind(this)();

                if (window.sessionStorage.getItem(['requireNext'])) {
                    var lastcmd = window.sessionStorage.getItem(['lastcmd']);

                    switch (true) {
                        case /^(balse|shutdown|shutdown_self)$/.test(lastcmd):
                            sendQuery.bind(this)('DELETE', { command: lastcmd, confirmation: e.target.value });

                            if (e.target.value == 'yes') {
                                 displayNodeDownMsg.bind(this)(lastcmd);
                            }

                            break;

                        case /^(set|add|replace|append|prepend)\s([a-z0-9]+)\s0\s([0-9]+)\s([0-9]+)$/.test(lastcmd) :
                            sendQuery.bind(this)('POST', { command: RegExp.$1, key: RegExp.$2, exptime: RegExp.$3, bytes: RegExp.$4, value: e.target.value });
                            break;

                        case /^(cas)\s([a-z0-9]+)\s0\s([0-9]+)\s([0-9]+)\s([0-9]+)$/.test(lastcmd) :
                            sendQuery.bind(this)('POST', { command: RegExp.$1, key: RegExp.$2, exptime: RegExp.$3, bytes: RegExp.$4, casid: RegExp.$5, value: e.target.value});
                            break;

                    }
          
                    window.sessionStorage.removeItem(['requireNext']);
                }

                window.sessionStorage.setItem(['lastcmd'],[e.target.value]);
                switch (true) {
                    // GET =========================================================================
                    case /^(stats|stat)(\s(.*))*$/.test(e.target.value) :
                        sendQuery.bind(this)('GET', null, RegExp.$1+"/"+RegExp.$3, 'json');
                        break;

                    case /^(whoami|nodelist|version)$/.test(e.target.value) :
                        console.log(this.state.nodeInfo);
                        sendQuery.bind(this)('GET', null, RegExp.$1 );
                        break;
                    case /^(get|gets)\s(.+)$/.test(e.target.value) :
                        sendQuery.bind(this)('GET', null, RegExp.$1+"/"+RegExp.$2 );
                        break;

                    // DELETE =========================================================================
                    case /^(balse|shutdown|shutdown_self|rbalse)\s*([a-z]*)$/.test(e.target.value) :
                        var cmd = RegExp.$1;
                        sendQuery.bind(this)('DELETE', { command: RegExp.$1, confirmation: RegExp.$2 });
                        
                        // require next line(yes/no)!!
                        if (/^(balse|shutdown|shutdown_self)$/.test(cmd)) {
                            window.sessionStorage.setItem(['requireNext'],[true]);
                        }
                        break;

                    // POST =========================================================================
                    case /^(set|add|replace|append|prepend)\s([a-z0-9]+)\s0\s([0-9]+)\s([0-9]+)$/.test(e.target.value) :
                        window.sessionStorage.setItem(['requireNext'],[true]);
                        break;

                    case /^(set_expt)\s([a-z0-9]+)\s([0-9]+)$/.test(e.target.value) :
                        sendQuery.bind(this)('POST', { command: RegExp.$1, key: RegExp.$2, exptime: RegExp.$3 });
                        break;

                    case /^(cas)\s([a-z0-9]+)\s0\s([0-9]+)\s([0-9]+)\s([0-9]+)$/.test(e.target.value) :
                        window.sessionStorage.setItem(['requireNext'],[true]);
                        break;

                    case /^(incr|decr)\s([a-z0-9]+)\s([-]*[0-9]+)$/.test(e.target.value) :
                        sendQuery.bind(this)('POST', { command: RegExp.$1, key: RegExp.$2, digit: RegExp.$3 });
                        break;

                    case /^(delete)\s([a-z0-9]+)$/.test(e.target.value) :
                        sendQuery.bind(this)('POST', { command: RegExp.$1, key: RegExp.$2 });
                        break;


                    // PUT =========================================================================
                    case /^(release|recover)$/.test(e.target.value) :
                        sendQuery.bind(this)('PUT', {command: RegExp.$1});
                        break;

                    case /^(set_lost_action|set_log_level)\s(.+)$/.test(e.target.value) :
                        sendQuery.bind(this)('PUT', {command: RegExp.$1, level: RegExp.$2, lost: RegExp.$2});
                        break;

                    case /^(set_auto_recover)\s([a-z]+)\s*([0-9]*)$/.test(e.target.value) :
                        sendQuery.bind(this)('PUT', {command: RegExp.$1, bool: RegExp.$2, sec: RegExp.$3});
                        break;

                    case /^(set_log_level)\s([a-z]+)$/.test(e.target.value) :
                        sendQuery.bind(this)('PUT', {command: RegExp.$1, level: RegExp.$2});
                        break;

                    // Same Command Again=========================================================================
                    //case '!!':
                    //    this.setState({cmd: "please input command"});
                    //        this.setState({result: ''});
                    //    break;

                    // No Command =========================================================================
                    case e.target.value == '':
                        console.log('hogehoge');
                        var lastcmd = '> ';
                        this.setState({result: this.state.result +'<br>'+lastcmd});
                        break;

                    // Not supported yet on virtual console =========================================================================
                    default:
                        console.log(e.target.value.size);
                        var res = 'Not Supported';
                        showResult.bind(this)(res);
                        clearForm.bind(this)();
                        break;
                }
            }
        },
        render: function() {
            var lines = this.state.result.split('<br>').map(function(line) {
                if (line) {
                    return (<p className='res-line'>{line}</p>);
                } else {
                    return (<p className='res-line'>&nbsp;</p>);
                }
            });
            return (
              <div id="console">
                <div id="greeting">
                  <div id="greeting-aa">{this.state.greetingAA}</div>
                  <div id="greeting-msg">{this.state.greetingMessage}</div>
                </div>
                <div id="nodeInfo">
                  <div id="non-active-nodelist">{this.state.nonActiveNodelist}</div>
                  <div id="active-nodelist">{this.state.activeNodelist}</div>
                </div>
                <div id="displayArea">
                  {lines}
                  <p id='inputArea'>&gt; <input id='inputBox' type="text" placeholder='please input command' onChange={this.changeText} onKeyDown={this.sendCommand} ref="command" autoFocus={focus} /></p>
                </div>
              </div>
            );
        }
    }
);

React.render(<Test />, document.getElementById("reactArea"));

