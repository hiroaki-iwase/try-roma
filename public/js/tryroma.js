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

    console.log((value.match(/<br>/g)||[]).length);

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

var Test = React.createClass(
    {
        getInitialState() {
            return {
                result: ""
            };
        },
        sendCommand(e) {
            var ENTER = 13;
            if(e.keyCode == ENTER){
                if (window.sessionStorage.getItem(['requireNext'])) {
                    var lastcmd = window.sessionStorage.getItem(['lastcmd']);

                    switch (true) {
                        case /^(balse|shutdown|shutdown_self)$/.test(lastcmd):
                            sendQuery.bind(this)('DELETE', { command: lastcmd, confirmation: e.target.value });
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
                <div id="bottom">
                  {lines}
                  <p id='inputArea'>&gt; <input id='inputBox' type="text" placeholder='please input command' onChange={this.changeText} onKeyDown={this.sendCommand} ref="command" autoFocus={focus} /></p>
                </div>
              </div>
            );
        }
    }
);

React.render(<Test />, document.getElementById("reactArea"));

