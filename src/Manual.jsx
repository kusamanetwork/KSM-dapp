import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Route, Link } from 'react-router-dom';
import styled from 'styled-components';

import './manual.css';

import Claiming from './docs/claiming.md';
import Overview from './docs/overview.md';
import Security from './docs/security.md';

const Container = styled.div`
  height: 100%;
  width: 100%;  
  display: flex;
  flex-direction: row;
`;

const Main = styled.div`
  color: white;
  background: transparent;
  margin: 0;
  margin-left: 200px;
  width: calc(100vw - 200px);
`;

const Sidebar = styled.div`
  height: calc(100vh - 60px);
  width: 200px;
  display: flex;
  flex-direction: column;
  position: fixed;
`;

const SidebarButton = styled.button`
  height: 30px;
  width: 100%;
  background: transparent;
  color: white;
  border: none;
  :hover {
    background: white;
    color: black;
    cursor: pointer;
  }
`;

const MyLink = styled(Link)`
  height: 30px;
  width: 200px;
`;

const Config = [
  { title: "Overview", source: Overview, path: '/overview' },
  { title: "How to Claim", source: Claiming, path: '/claiming'},
  { title: "Governance", source: Security, path: '/governance' },
  { title: "Validator Security", source: Security, path: '/validators' },
  { title: "Code of Conduct", source: Security, path: '/code-of-conduct' },
  { title: "Critical Issues / Bugs", source: Security, path: '/issues' },

];

class Page extends React.Component {

  state = {
    page: null,
  }

  constructor(props) {
    super(props);
    fetch(props.source).then((res) => res.text()).then((text) => {
      this.setState({
        page: text,
      });
    });
  }

  render() {
    return <ReactMarkdown source={this.state.page}/>
  }

}

class Manual extends React.Component {

  renderLinks = () => {
    return Config.map((item) => {
      return (
        <MyLink to={`/manual${item.path}`}>
          <SidebarButton>
            {item.title}
          </SidebarButton>
        </MyLink>
      )
    })
  }

  renderRoutes = () => {
    return Config.map((item) => {
      return (
        <Route
          path={`/manual${item.path}`}
          render={() => (
            <Page source={item.source}/>
          )}
        />
      )
    })
  }

  render() {

    const buttons = this.renderLinks();
    const routes = this.renderRoutes();

    return (
      <Container>
        <Sidebar>
          {buttons}
        </Sidebar>
        <Main>
          {routes}
        </Main>
      </Container>
    )
  }
}

export default Manual;