import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboard, faThumbsUp, faUnlink } from '@fortawesome/free-solid-svg-icons';
import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import * as pUtil from '@polkadot/util';
import bs58 from 'bs58';
import React from 'react';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import styled from 'styled-components';

import Web3 from 'web3';

// Assets
import Kusama from './assets/kusama_word.png';

// Components
import InfoBox from './components/Info';

// Smart Contracts
import Claims from './build/contracts/Claims.json';
import FrozenToken from './build/contracts/FrozenToken.json';

// Colors
const HotPink = '#BC0066';

// Kusama Claim Prefix
const KusamaClaimPrefix = 'Pay KSMs to the Kusama account:';

const check = (address) => {
  const decoded = pUtil.bufferToU8a(bs58.decode(address));
  
  return decoded[0] === 2;
}

const Navbar = styled.div`
  width: 100vw;
  height: 60px;
  background: black;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  position: fixed;
  color: white;
  z-index: 100;
`;

const NavButton = styled.button`
  background: none;
  border: none;
  font-size: 16px;
  color: black;
  height: 100%;
  width: 120px;
  color: white;
  :hover {
    cursor: pointer;
    background: white;
    color: black;
  }
`;

const Main = styled.div`
  width: 100%;
  padding: 3%;
  display: flex;
  flex-direction: row-wrap;
  padding-top: 0;
  margin-top: 1%;
  @media (max-width: 750px) {
    flex-direction: column;
    padding: 0;
    justify-content: center;
    align-items: center;
  }
`;

const MainLeft = styled.div`
  display: flex;
  flex-direction: column;
  align-items: left;
  width: 42%;
  margin-right: 1%;
  background: rgba(255,255,255,1.0);
  border-radius: 12px;
  padding: 2%;
  @media (max-width: 750px) {
    width: 90%;
    margin-bottom: 3%;
  }
`;

const MainRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: left;
  width: 42%;
  margin-left: 1%;
  background: white;
  border-radius: 12px;
  padding: 2%;
  padding-top: 0;
  @media (max-width: 750px) {
    width: 90%;
    margin-bottom: 3%;
    margin-top: -1%;
  }
`;

const Spacer = styled.div`
  width: 100%;
  height: 60px;
  background: transparent;
`;

const SucceedIcon = styled(FontAwesomeIcon)`
  color: ${props => Boolean(props.status) ? 'green' : 'red'};
`;

const MyInput = styled.input`
  width: ${props => props.width}px !important;
  border-color: black;
  border-radius: 10px;
  border-width: 2px;
  padding: 2px;
  padding-left: 3px;
  font-size: 13px;
  margin-bottom: 16px;
  @media (max-width: 750px) {
    width: 90% !important;
  }
`;

const MySelect = styled.select`
  border-color: black;
  border-radius: 10px;
  border-width: 2px;
  padding: 1px;
  padding-left: 2px;
  background: white;
`;

const MyLink = styled(Link)`
  width: 120px;
  height: 100%;
`;

const MyButton = styled.button`
  border-color: black;
  border-radius: 10px;
  border-width: 2px;
  padding: 10px;
  background: white;
  :hover {
    background: black;
    color: white;
    cursor: pointer;
  }
`;

const TextareaButton = styled.button`
  background: black;
  color: white;
  border-color: black;
  :hover {
    cursor: pointer;
  }
  @media (max-width: 750px) {
    margin-left: 80%;
  }
`;

const DisabledText = styled.div`
  background: #EBEBE4;
  font-size: 12px;
  color: #545454;
  border-style: solid;
  border-color: silver;
  border-width: 0.25px;
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  height: 25px;
  overflow-x: hidden;
  position: relative;
`;

const DisabledButton = styled.button`
  position: absolute;
  right: 0;
  :hover {
    cursor: pointer;
    background: #fff;
  }
`;


class App extends React.Component {

  state = {
    claims: null,
    correctAmendment: null,
    defaultAccount: null,
    frozenToken: null,
    myCrypto: false,
    pubKey: null,
    showAmend: false,
    status: null,
    web3: null,
  }

  componentDidMount = async () => {

  const w3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/7121204aac9a45dcb9c2cc825fb85159"));

  this.setState({
    web3: w3,
  });

  }

  initializeContracts = async (web3) => {

    const frozenToken = new web3.eth.Contract(FrozenToken.abi, "0xb59f67A8BfF5d8Cd03f6AC17265c550Ed8F33907");
    const claims = new web3.eth.Contract(Claims.abi, "0x9a1B58399EdEBd0606420045fEa0347c24fB86c2");
  
    this.setState({
      claims,
      frozenToken,
    });
  }

  inputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'valid-check') {
      let notice, pubKey, status;
      // Check if its a properly encoding Kusama address.
      if (!check(value)) {
        try {
          pubKey = pUtil.u8aToHex(decodeAddress(value));
          // It's either a Substrate or Polkadot address.
          // pubKey = 'This is not a Kusama address.'
          notice = true;
          status = true;
        } catch (e) {
          pubKey = 'invalid'
          notice = false;
          status = false;
        }
      } else {
        try {
          pubKey = pUtil.u8aToHex(decodeAddress(value, false,  2));
          notice = false;
          status = true;
        } catch (e) {
          pubKey = 'invalid';
          notice = false;
          status = false;
        }
      }

      this.setState({
        notice,
        pubKey,
        status,
      })
    }

    this.setState({
      [name]: value,
    });
  }

  handleSelect = (e) => {
    const { value } = e.target;
    if (value === 'MyCrypto') {
      this.setState({
        myCrypto: true,
      });
    }
  }

  render() {
    if (this.state.web3 !== null && !this.state.claims && !this.state.frozenToken) {
      this.initializeContracts(this.state.web3);
    }

    return (
      <Router>
      <div>
        <Navbar>
          <img src={Kusama} width='120px' height='20px'/>
        </Navbar>
        <Spacer/>
        <Route
          path='/'
          render={() => (
            <>
              <Main>
                <MainLeft>
                  <h1>Claim KSM</h1>
                  <br/>
                  <p>This DApp will walk you through the process of claiming KSM. In order to claim KSM you need to have an allocation of DOTs.</p>
                  <p>Using other processes to claim KSM is not recommended. </p>
                  <h2>Create a Kusama address</h2>
                  <br/>
                  <p>You will first need to create an account. This is the account that you will be claiming your KSM to, so make sure to extra precautions to keep it secure. For some tips on keeping your key safe, <a href='#'>see here</a>. Create an account using one of the following methods:</p>
                  <ul>
                    <li><a href="https://polkadot.js.org/apps/#/accounts" target="_blank">Polkadot UI</a> <b>(Recommended for most users)</b></li>
                    <li><code><a href="https://guide.kusama.network/en/latest/start/claims/#using-subkey">subkey</a></code> <b>(Most secure)</b></li>
                    <li><a href="https://chrome.google.com/webstore/detail/enzyme/amligljifngdnodkebecdijmhnhojohh" target="_blank">Enzyme wallet</a> <b>(Chrome only)</b></li>
                    <li><a href="https://polkawallet.io/#download" target="_blank">Polkawallet</a></li>
                  </ul>
                  <br/>
                  <br/>
                  <a href="https://guide.kusama.network/en/latest/start/claims/" target="_blank">See full step-by-step instructions.</a><br/>
                  <a href="https://riot.im/app/#/room/#KSMAClaims:polkadot.builders" target="_blank">Need help? Join the Claims Support chat.</a>

                </MainLeft>
                <MainRight>
                  <h4>Please claim your KSMs by using the Polkadot JS <a href="https://polkadot.js.org/apps/#/claims">Claims app</a>. If you need help please refer to the Kusama <a href="https://guide.kusama.network/en/latest/start/dot-holders/">guide</a>.</h4>
                {/* <h4>How will you claim?</h4>
                <MySelect onChange={this.handleSelect} defaultValue="">
                  <option value="" disabled hidden>Choose your method to claim</option>
                  <option value="MyCrypto" disabled>On Ethereum (before genesis)</option>
                  <option value="On-chain" disabled>On Kusama (after genesis)</option>
                </MySelect> */}
                {
                  this.state.myCrypto &&
                    <div>
                      <h4>Claims contract:</h4>
                      <DisabledText>
                        0x9a1B58399EdEBd0606420045fEa0347c24fB86c2
                        <CopyToClipboard text="0x9a1B58399EdEBd0606420045fEa0347c24fB86c2">
                          <DisabledButton>
                            <FontAwesomeIcon icon={faClipboard}/>
                          </DisabledButton>
                        </CopyToClipboard>
                      </DisabledText>
                      <h4>ABI:</h4>
                      <div style={{ position: 'relative' }}>
                        <textarea style={{width: '100%', height: '100px', resize: 'none'}} disabled>{JSON.stringify(Claims.abi)}</textarea>
                        <CopyToClipboard text={JSON.stringify(Claims.abi)}>
                          <TextareaButton>click to copy</TextareaButton>
                        </CopyToClipboard>
                      </div>
                      <h4>What is your Kusama or Substrate address?</h4>
                      <div>
                        <MyInput
                          width='450'
                          name='valid-check'
                          onChange={this.inputChange}
                        />
                        {' '}<SucceedIcon icon={Boolean(this.state.status) ? faThumbsUp : faUnlink} status={this.state.status}/>
                      </div>
                      {
                        this.state.notice &&
                          <p style ={{ color: 'red' }}>This is a Substrate address. Your Kusama address will be: {encodeAddress(pUtil.hexToU8a(this.state.pubKey), 2)}</p>
                      }
                      <p>Public Key:</p>
                      <DisabledText>
                        {this.state.pubKey || ''}
                        <CopyToClipboard text={this.state.pubKey || ''}>
                          <DisabledButton>
                            <FontAwesomeIcon icon={faClipboard}/>
                          </DisabledButton>
                        </CopyToClipboard>
                      </DisabledText>
                      <br />
                      <p>You will need to <a href="https://github.com/MyCryptoHQ/MyCrypto/releases" target="_blank">download</a> and use MyCrypto locally to make this transaction.</p>
                      <a href="https://guide.kusama.network/en/latest/start/dot-holders/" target="_blank">Instructions for DOT holders.</a><br/>
                    </div>
                }
                {
                  this.state.kusama &&
                  <div>
                    <h4>Please claim your KSMs by using the Polkadot JS <a href="https://polkadot.js.org/apps/#/claims">Claims app</a>. If you need help please refer to the Kusama <a href="https://guide.kusama.network/en/latest/start/dot-holders/">guide</a>.</h4>
                  </div>
                }
                </MainRight>
              </Main>
              <InfoBox claims={this.state.claims || null} frozenToken={this.state.frozenToken || null} />
            </>
          )}/>
      </div>
      </Router>
    );
  }
}

export default App;
