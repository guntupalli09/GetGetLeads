import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import styled from 'styled-components';
import RealTimePageViews from '../Analytics/RealtimePageViews';
import TrafficSources from '../Analytics/TrafficSources'; // Ensure this is imported correctly
import { useNavigate } from 'react-router-dom';

const StyledTabList = styled(TabList)`
  list-style-type: none;
  padding: 0;
  display: flex;
  margin: 0;
  border-bottom: 1px solid #ccc;
`;

const StyledTab = styled(Tab)`
  padding: 10px 20px;
  cursor: pointer;
  border: 1px solid transparent;
  border-bottom: none;
  &.react-tabs__tab--selected {
    background: var(--primary-800);
    border-color: var(--primary-700);
    color: var(--accent-500);
  }
`;

const BackButton = styled.button`
  padding: 8px 16px;
  margin: 10px 0;
  background-color: var(--primary-700);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: var(--primary-800);
  }
`;

const FeatureHeader = styled.h1`
  color: var(--accent-500);
  font-size: 24px;
  margin-bottom: 16px;
`;

const AnalyticsDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <BackButton onClick={() => navigate(-1)}>Back</BackButton>
      <FeatureHeader>Analytics Dashboard</FeatureHeader>
      <Tabs>
        <StyledTabList>
          <StyledTab>Overview</StyledTab>
          <StyledTab>Page Insights</StyledTab>
          <StyledTab>Traffic Sources</StyledTab>
        </StyledTabList>

        <TabPanel>
          <h2>General Overview</h2>
          {/* General analytics overview components here */}
        </TabPanel>
        <TabPanel>
          <RealTimePageViews />
        </TabPanel>
        <TabPanel>
          <TrafficSources />
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
