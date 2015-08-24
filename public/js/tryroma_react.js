/* =====================================================================================================================
 *  React Component
 * ===================================================================================================================== */
var Title = React.createClass(
    {
        componentWillMount() {
            window.sessionStorage.removeItem(['requireNext']);
            window.sessionStorage.removeItem(['lastcmd']);
        },
        render: function() {
            return (
                <div id='title'>
                  <center>
                    Try R<img src="../img/ROMA.png" id='title-image'/>MA
                  </center>
                </div>
            );
        }
    }
);

var SelectModeButton = React.createClass(
    {
        getInitialState() {
            return{
                mode: null,
            };
        },
        selectMode(e) {
            if (e.target.name == 'tutorial') {
                $('#console-screen').animate({'margin-left':'220px', 'margin-right':'20px'}, 500);
                $('.side-bar').css({'visibility':'visible'});
                $('.side-bar > ul > li:nth-of-type(1)').css({'color':'red'});

                $("#tutorial-button").prop("disabled", true);
                $("#free-button").hide('slow', function(){$("#free-button").remove();});
                this.setState({mode: 'tutorial'});

            } else if (e.target.name == 'free') {
                $("#free-button").prop("disabled", true);
                $("#tutorial-button").hide('slow', function(){$("#tutorial-button").remove();});
                this.setState({mode: 'free'});
            }
        },
        render: function() {
            return (
                <div>
                  <div id='mode-button'>
                    <center>
                      <button id='tutorial-button' type="button" name="tutorial" onClick={this.selectMode}>
                        Tutorial mode
                      </button>
                      <button id='free-button' type="button" name="free" onClick={this.selectMode}>
                        Free mode
                      </button>
                    </center>
                  </div>

                  <Main mode={this.state.mode} />

                </div>
            );
        }
    }
);

var Main = React.createClass(
    {
        render: function() {
            return (
                <div>
                  <TutorialSideBar mode={this.props.mode} />

                  <Console mode={this.props.mode} />
                </div>
            );
        }
    }
);

var TutorialSideBar = React.createClass(
    {
        render: function() {
            return (
                <span className='side-bar'>
                  <ul>
                    <li>Check Status</li>
                    <ul className='tutorial-commands'>
                      <li id='stats'>stat</li>
                      <li id='nodelist'>nodelist</li>
                    </ul>
                    <li>Manage Data</li>
                    <ul className='tutorial-commands'>
                      <li id='set'>set</li>
                      <li id='get'>get</li>
                      <li id='add'>add</li>
                      <li id='delete'>delete</li>
                    </ul>
                    <li>Instance shutdown</li>
                    <ul className='tutorial-commands'>
                      <li id='release'>release</li>
                      <li id='shutdown_self'>shutdown_self</li>
                    </ul>
                    <li>Recover redundancy</li>
                    <ul className='tutorial-commands'>
                      <li id='recover'>recover</li>
                      <li id='set_auto_recover'>set_auto_recover</li>
                    </ul>
                    <li>STOP ROMA</li>
                    <ul className='tutorial-commands'>
                      <li id='balse'>balse</li>
                    </ul>
                  </ul>
                </span>
            );
        }
    }
);


var Console = React.createClass(
    {
        getDefaultProps() {
            return {
                ENTER: 13,
                placeholder: 'please select mode',
            };
        },
        getInitialState() {
            return {
                res: "",
                downNodeMsg: "",
                aliveNodeMsg: "",
                nodeList: ['localhost_10001', 'localhost_10002', 'localhost_10003', 'localhost_10004', 'localhost_10005'],
                tutorialCommandList: getCommandList(),
                tutorialCommandUsage: getCommandUsage(),
                tutorialCommandExplanation: getCommandExplanation(),
                tutorialCommandResult: getCommandResult(),
                placeholder: this.props.placeholder,
                explain: '',
                nextCmd: '',
            };
        },
        componentWillReceiveProps(nextProps) {
            this.setState({placeholder: 'Please input command'}) 
        },
        sendCommand(e) {
            if(e.keyCode == this.props.ENTER){
                if (this.props.mode == 'free') {
                    var response = sendPureCommand.bind(this)(e.target.value);
                    this.setState({res: response});

                } else if (this.props.mode == 'tutorial') {
                    window.sessionStorage.setItem(['lastcmd'],[e.target.value]);

                    if (e.target.value == '') {

                        this.setState({res: ''}); 
                        this.state.tutorialCommandResult.shift();

                        var nextCmd = this.state.tutorialCommandList.shift();
                        this.setState({nextCmd: nextCmd});

                        changeSideBarColor(nextCmd);
                        nextCmd = removeDigit(nextCmd)
                        if (nextCmd) {
                            changePlaceHolder.bind(this)(nextCmd);
                            this.setState({cmd: this.state.tutorialCommandUsage.shift()});
                            this.setState({explain: this.state.tutorialCommandExplanation.shift()});
                            if (nextCmd == 'Finished!!') {
                                $("#inputBox").prop("disabled", true);
                                this.setState({nextGuidance: ''})
                            }
                        } else {
                            console.log('Finished');
                        }

                    } else {
                        var correctCmd = this.state.nextCmd;
                        if (e.target.value == correctCmd) {
                            //response = this.state.tutorialCommandResult.shift();
                            response = '> '+ e.target.value+'<br><br>';
                            response += this.state.tutorialCommandResult[0];
                            nextGuidance = "<br><br>Good!! Let's go Next Command, please push Enter."

                            this.setState({res: response});
                            this.setState({nextGuidance: nextGuidance});
                        } else {
                            var retryRes = showResult.bind(this)('<br>please input [' + correctCmd + '] command<br>');
                            this.setState({res: retryRes});
                        }
                        clearForm.bind(this)();
                    }
                } 
            } 
        },
        render: function() {
            var nodeMsg = {
                nonActive: this.state.downNodeMsg,
                active: this.state.aliveNodeMsg,
            };

            var whichModeHeader;
            if (this.props.mode == 'free') {
                whichModeHeader = <FreeHeader nodeMsg={nodeMsg} />;
            } else if (this.props.mode == 'tutorial') {
                whichModeHeader = <TutorialHeader cmd={this.state.cmd} explain={this.state.explain}/>;
            } else if (this.props.mode == null) {
                whichModeHeader = <FirstHeader />;
            }

            var whichModeDisplay;
            if (this.props.mode == 'free') {
                whichModeDisplay = <FreeResult response={this.state.res} />;
            } else if (this.props.mode == 'tutorial') {
                whichModeDisplay = <TutorialResult response={this.state.res} nextGuidance={this.state.nextGuidance}/>;
            }

            return (
              <div id="console-screen">

                {whichModeHeader}
                {whichModeDisplay}

                <div id='inputArea'>
                  <p className='no-margin'>&gt; <input id='inputBox' type="text" placeholder={this.state.placeholder} onChange={this.changeText} onKeyDown={this.sendCommand} ref="command" autoFocus={focus} /></p>
                </div>
              </div>
            );
        }
    }
);

var FirstHeader = React.createClass(
    {
        getDefaultProps() {
            return {
                greetingAA: heardoc_main(),
                greetingMessage: 'Please select mode!',
            };
        },
        render: function() {
            var style = {
                greeting: {
                    color: '#00cede',
                },
                greetingAA: {
                    fontSize: '13px',
                },
                greetingMsg: {
                    fontSize: '26px',
                },
            };
            return (
                <div style={style.greeting}>
                  <div style={style.greetingAA}>{this.props.greetingAA}</div>
                  <div style={style.greetingMsg}>{this.props.greetingMessage}</div>
                </div>
            );
        }
    }
);


var FreeHeader = React.createClass(
    {
        getDefaultProps() {
            return {
                greetingAA: heardoc_free(),
                greetingMessage: 'Please feel free to execute ROMA command!!',
            };
        },
        getInitialState() {
            return {
                greetingAA: this.props.greetingAA,
                greetingMessage: this.props.greetingMessage,
                redMsg: '',
                greenMsg: '',
            };
        },
        componentWillReceiveProps(nextProps) {
            clearHeader.bind(this)();
            this.setState({redMsg: nextProps.nodeMsg['nonActive']});
            this.setState({greenMsg: nextProps.nodeMsg['active']});
        },
        render: function() {
            var style = {
                greeting: {
                    color: '#00cede',
                },
                greetingAA: {
                    fontSize: '20px',
                },
                greetingMsg: {
                    fontSize: '26px',
                },
                nonActive: {
                    color: 'red',
                    fontSize: '33px',
                },
                active: {
                    color: 'lime',
                    fontSize: '20px',
                },
            };
            return (
                <div>
                  <div style={style.greeting}>
                    <div style={style.greetingAA}>{this.state.greetingAA}</div>
                    <div style={style.greetingMsg}>{this.state.greetingMessage}</div>
                  </div>
                  <div>
                    <div style={style.nonActive}>{this.state.redMsg.split('<br>').map(lines)}</div>
                    <div style={style.active}>{this.state.greenMsg.split('<br>').map(lines)}</div>
                  </div>
                </div>
            );
        }
    }
);

var TutorialHeader = React.createClass(
    {
        getInitialState() {
            return {
                greetingAA: heardoc_tutorial(),
                greetingMessage: "This mode is tutorial of ROMA basic usage.<br>This mode explain ROMA command one by one.<br><br>Let's start tutorial!!<br>Please push Enter Key ",
                cmd: '',
                explain: '',
            };
        },
        componentWillReceiveProps(nextProps) {
            clearHeader.bind(this)();
            this.setState({explain: nextProps.explain});
            this.setState({cmd: nextProps.cmd});
        },
        render: function() {
            var style = {
                headerArea: {
                    wordWrap: 'break-word',
                },
                greeting: {
                    color: '#00cede',
                },
                greetingAA: {
                    fontSize: '15px',
                },
                greetingMsg: {
                    fontSize: '25px',
                },
                explain: {
                    color: 'lime',
                },
                tutorialCmd: {
                    fontSize: '30px',
                    textDecoration: 'underline',
                },
                tutorialMsg: {
                    fontSize: '25px',
                    marginLeft: '25px',
                },
            };
            return (
                <div style={style.headerArea}>
                  <div style={style.greeting}>
                    <div style={style.greetingAA}>{this.state.greetingAA}</div>
                    <div style={style.greetingMsg}>{this.state.greetingMessage.split('<br>').map(lines)}</div>
                  </div>
                  <div style={style.explain}>
                    <div style={style.tutorialCmd}>{this.state.cmd}</div>
                    <div style={style.tutorialMsg}>{this.state.explain.split('<br>').map(lines)}</div>
                  </div>
                </div>
            );
        }
    }
);

var FreeResult = React.createClass(
    {
        getInitialState() {
            return {
                response: '',
            };
        },
        componentWillReceiveProps(nextProps) {
            if (nextProps.response.lastIndexOf('BYE') == -1) {
                this.setState({response: this.state.response + '<br>' + nextProps.response});
            } else {
                this.setState({response: nextProps.response});
            }
        },
        render: function() {
            return (
                <div id="responseArea">
                  {this.state.response.split('<br>').map(lines)}
                </div>
            );
        }
    }
);

var TutorialResult = React.createClass(
    {
        getDefaultProps() {
            return {
                nextGuidance: '',
            }
        },
        getInitialState() {
            return {
                response: '',
            };
        },
        render: function() {
            var style = {
                next: {
                    color: 'lime',
                },
            };
            return (
                <div id="responseArea">
                  {this.props.response.split('<br>').map(lines)}
                  <div style={style.next}>{this.props.nextGuidance.split('<br>').map(lines)}</div>
                </div>
            );
        }
    }
);

var FooterInfo = React.createClass(
    {
        render: function() {
            return (
                <div>
                  <center>
                    <p className='no-margin'>This site was inspired by Try Redis.</p>
                    <p className='no-margin'>The source code to Try ROMA is available on <a href='https://github.com/hiroaki-iwase/try-roma'>GitHub</a>.</p>
                  </center>
                </div>
            );
        }
    }
);


// root component
var TryRoma = React.createClass(
    {
        render: function() {
            return (
                <div>
                  <Title />
                  <SelectModeButton />
                  <FooterInfo />
                </div>
            );
        }
    }
);

React.render(<TryRoma />, document.getElementById("reactArea"));

