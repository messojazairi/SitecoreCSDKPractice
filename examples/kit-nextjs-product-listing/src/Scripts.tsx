'use client';
import { JSX } from 'react';
import { EditingScripts } from '@sitecore-content-sdk/nextjs';
// The BYOC bundle imports external (BYOC) components into the app and makes sure they are ready to be used
// import BYOC from 'src/byoc';
import CdpPageView from 'components/content-sdk/CdpPageView';

const Scripts = (): JSX.Element => {
  return (
    <>
      {/* <BYOC /> */}
      {/* <FEAASScripts /> */}
      <CdpPageView />
      <EditingScripts />
    </>
  );
};

export default Scripts;
