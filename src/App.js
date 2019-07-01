import * as pUtil from '@polkadot/util';
import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee, faGifts, faUnlink } from '@fortawesome/free-solid-svg-icons';
import Web3 from 'web3';

import Kusama from './assets/kusama_word.png';

import Claims from './build/contracts/Claims.json';
import FrozenToken from './build/contracts/FrozenToken.json';

const Navbar = styled.div`
  width: 100%;
  height: 80px;
  background: #15d17c;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  position: fixed;
`;

const NavButton = styled.button`
  background: none;
  border: none;
  font-size: 16px;
  color: black;
  height: 100%;
  width: 120px;
  :hover {
    cursor: pointer;
    background: white;
  }
`;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  align-items: left;
  width: auto;
  margin-left: 10%;
  margin-right: 10% !important;
  background: rgba(255,255,255,1.0);
  padding: 6%;
  padding-top: 8%;
`;

const SucceedIcon = styled(FontAwesomeIcon)`
  color: ${props => Boolean(props.status) ? 'green' : 'red'};
`;

class App extends React.Component {

  state = {
    claims: null,
    correctAmendment: null,
    defaultAccount: null,
    frozenToken: null,
    metamask: false,
    myCrypto: false,
    showAmend: false,
    status: null,
    web3: null,
  }

  componentDidMount = async () => {
    window.addEventListener('load', async () => {
      let w3, account;
      if (typeof window.web3 !== 'undefined') {
        w3 = new Web3(window.web3.currentProvider);
        account = (await w3.eth.getAccounts())[0];
      } else {
        console.log('No web3? You should consider trying MetaMask!')
        w3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
      }

      this.setState({
        defaultAccount: account,
        web3: w3,
      });
    })
  }

  initializeContracts = async (web3) => {
    const netId = await web3.eth.net.getId();

    const frozenToken = new web3.eth.Contract(FrozenToken.abi, FrozenToken.networks[netId.toString()].address);
    const claims = new web3.eth.Contract(Claims.abi, Claims.networks[netId.toString()].address);
  
    this.setState({
      claims,
      frozenToken,
    });
  }

  inputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'valid-check') {
      if (value.length === 48) {
        this.setState({
          status: 'true',
        })
      } else {
        if (this.state.status === 'true') {
          this.setState({
            status: null,
          })
        }
      }
    }

    if (name === 'balance-check') {
      if (value.length !== 48) {
        return;
      }
    }

    this.setState({
      [name]: value,
    });
  }

  handleSelect = (e) => {
    const { value } = e.target;
    if (value === 'MyCrypto') {
      this.setState({
        metamask: false,
        myCrypto: true,
      });
    } else {
      this.setState({
        metamask: true,
        myCrypto: false,
      });
    }
  }

  tryClaim = () => {

  }

  validateAmend = async (e) => {
    const { value } = e.target;
    if (!this.state.claims) {
      return;
    }

    const { claims, defaultAccount } = this.state;

    const amend = await claims.methods.amended(value).call();

    if (amend === defaultAccount) {
      this.setState({
        correctAmendment: 'true',
      })
    }
  }

  render() {
    if (this.state.web3 !== null) {
      this.initializeContracts(this.state.web3);
    }

    return (
      <div>
        <Navbar>
          <img src={Kusama} width='120px' height='20px'/>
          <NavButton>Home</NavButton>
          <NavButton>User Manual</NavButton>
          <NavButton>Claims</NavButton>
          <NavButton>Faucet</NavButton>
          <NavButton><FontAwesomeIcon icon={faGifts}/>{' '}Swag Store</NavButton>
        </Navbar>
        <Main>
          <h1>Claim KSMAs</h1>
          <p>This DApp will walk you through the process of claiming KSMAs. In order to claim KSMAs you need to have an allocation of DOTs.</p>
          <h2>Create a Kusama address</h2>
          <p>You will first need to create an account. This is the account that you will be claiming your KSMAs to, so make sure to extra precautions to keep it secure. For some tips on keeping your key safe, <a href='#'>see here</a>. Create an account using one of the following methods:</p>
          <ul>
            <li>Polkadot UI <b>(Recommended for most users)</b></li>
            <li><code>subkey</code></li>
            <li>Enzyme wallet</li>
            <li>Polkawallet</li>
          </ul>
          <h4>Paste your address here to make sure it's valid:</h4>
          <div>
            <input
              name='valid-check'
              onChange={this.inputChange}
            />
            {' '}<SucceedIcon icon={Boolean(this.state.status) ? faCoffee : faUnlink} status={this.state.status}/>
          </div>
          <br/>
          <select onChange={this.handleSelect} defaultValue="">
            <option value="" disabled hidden>Choose your method to claim</option>
            <option value="Metamask">Metamask</option>
            <option value="MyCrypto">MyCrypto</option>
          </select>
          {
            this.state.metamask && 
              <div>
                <h3>Metamask</h3>
                <p>You will send the claim transaction from your currently active Metamask account.</p>
                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                  <p>Are you claiming for an amended address?</p>
                  <input type='checkbox' onChange={() => this.setState({ showAmend: !this.state.showAmend })}></input>
                </div>
                {
                  this.state.showAmend &&
                    <div>
                      <p>Which address is it?</p>
                      <input onChange={this.validateAmend}/>
                      {' '}<SucceedIcon icon={Boolean(this.state.status) ? faCoffee : faUnlink} status={this.state.correctAmendment}/>
                    </div>
                }
                <p>Input your Kusama address:</p>
                <input
                  name='metamask-claim'
                  onChange={this.inputChange}
                />
                <button
                  onClick={this.tryClaim}
                >Claim</button>
              </div>
          }
          {
            this.state.myCrypto &&
              <div>
                <h3>MyCrypto</h3>
                <p>Does not require in browser compatibility (send from MyCrypto)</p>
              </div>
          }
          <h2>Check your information:</h2>
          <h4>Paste address to your DOT allocation below to check your Kusama address, index and balance:</h4>
          <input
            name='balance-check'
            onChange={this.inputChange}
          />
          <p><b>Address:</b> 5xxxxxx...xxx <b>Index:</b> 11 <b>Balance:</b> 1337 KSMAs</p>
        </Main>
      </div>
    );
  }
}

export default App;
