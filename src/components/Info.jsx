import { encodeAddress } from '@polkadot/keyring';
import * as pUtil from '@polkadot/util';
import React from 'react';
import styled from 'styled-components';

const MainBottom = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 90%;
  margin-left: 3%;
  margin-top: -1%;
  margin-bottom: 3%;
  background: white;
  border-radius: 12px;
  padding: 2%;
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
  @media (max-width: 500px) {
    width: 90% !important;
  }
`;

class InfoBox extends React.Component {

  state = {
    amended: false,
    balData: null,
    noBalance: false,
  }


  balanceCheck = async (e) => {
    let { value } = e.target;

    if (value.length !== 42) {
      // Better ethereum address validity check.
      // console.log(value);
      return;
    }
    if (!this.props.frozenToken || !this.props.claims) {
      return;
    }

    const logs = await this.props.claims.getPastEvents('Amended', {
      fromBlock: '8167892',
      toBlock: 'latest',
      filter: {
        amendedTo: [value],
      }
    });

    let amended = false;
    if (logs && logs.length && value !== '0x00b46c2526e227482e2EbB8f4C69E4674d262E75') {
      value = logs[0].returnValues.original;
      amended = logs[0].returnValues.original;
    }

    const vested = await this.props.claims.getPastEvents('Vested', {
      fromBlock: '8167892',
      toBlock: 'latest',
      filter: {
        eth: [value],
      }
    });

    let vestingAmt;
    if (vested && vested.length) {
      vestingAmt = vested[0].returnValues.amount;
    }

    let bal = await this.props.frozenToken.methods.balanceOf(value).call();
    if (Number(bal) === 0) {
      this.setState({
        noBalance: true,
      });
      return;
    };

    const claimData = await this.props.claims.methods.claims(value).call();
    const { pubKey, index } = claimData;
    let kusamaAddress;
    if (pubKey !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
      kusamaAddress = encodeAddress(pUtil.hexToU8a(pubKey), 2);
    }

    // Normalization
    bal = Number(bal) / 1000;
    if (vestingAmt) {
      vestingAmt = Number(vestingAmt) / 1000;
    }
    
    this.setState({
      amended,
      balData: {
        bal,
        index: index || null,
        kusamaAddress: kusamaAddress || null,
        pubKey: pubKey || null,
        vested: vestingAmt,
      },
      noBalance: false,
    });
  }

  render() {
    // Collect the data here.
    const { amended, balData, noBalance } = this.state;
    const claimed = balData && balData.pubKey !== '0x0000000000000000000000000000000000000000000000000000000000000000' && balData.bal !== 0;

    return (
      <MainBottom>
        <h2>Check your information:</h2>
        <h4>Paste the Ethereum address to your DOT allocation below to check your Kusama address, index and balance:</h4>
        <MyInput
          width='500'
          name='balance-check'
          onChange={this.balanceCheck}
        />
        {
          noBalance &&
            <p>No associated DOT balance for this Ethereum account.</p>
        }

        {
          amended &&
          <p><b>Amended for:</b>{balData ? amended : ''}</p>
        }
        <p><b>Kusama address:</b> {(balData && balData.kusamaAddress) ? (claimed ? balData.kusamaAddress : 'Not claimed') : 'None'}</p>
        <p><b>Public key:</b> {(balData && balData.pubKey) ? (claimed ? balData.pubKey : 'Not claimed') : 'None'}</p>
        <p><b>Index:</b> {(balData && balData.index) ? (claimed ? balData.index : 'Not claimed') : 'None'}</p> 
        <p><b>Balance:</b> {balData ? balData.bal : '0'} KSM {balData && balData.vested ? `(${balData.vested} vested)` : ''}</p>
      </MainBottom>
    );
  }
}

export default InfoBox;
