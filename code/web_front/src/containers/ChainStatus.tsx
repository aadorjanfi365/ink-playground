import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Abi } from '@polkadot/api-contract';
import { RootStore } from './Root';
import PutCodeModalButton from './PutCodeModalButton';
import InstantiateModalButton from './InstantiateModalButton';
import PlasmInstantiateModalButton from './PlasmInstantiateModalButton';
import CallContractModalButton from './CallContractModalButton';
import { ApiPromise } from '@polkadot/api';

export type CodesObject = {
  [s: string]: {
    codeHash: string;
    name: string;
    abi: Abi;
  };
}

export type InstancesObject = {
  [s: string]: {
    address: string;
    codeHash: string;
    name: string;
  };
}

type propType = {
  api: ApiPromise | null;
  apiIsReady: boolean,
  wasm: Uint8Array | null;
  metadata: string | null;
}

const ChainStatus = ( {api, apiIsReady, wasm, metadata}:propType ) => {

  const [codes,setCodes] = useState<CodesObject>({})
  const [instances,setInstances] = useState({})
  const [abi,setAbi] = useState<Abi | null>(null);

  const selectedChain = useSelector((state: RootStore) => state.chain.selectedChain);

  useEffect(()=>{
    setCodes({});
    setInstances({});
  },[selectedChain])

  useEffect(()=>{
    console.log("new codes:\n",codes)
  },[codes])

  useEffect(()=>{
    console.log("new instances:\n",instances)
  },[instances])

  useEffect(()=>{
    if(apiIsReady&&api&&api.registry&&metadata!=null){
      const _abi = new Abi(api.registry,JSON.parse(metadata));
      console.log(_abi);
      setAbi(_abi);
    }
  },[apiIsReady,api,metadata])

  if(!api || !apiIsReady){
    return (<p>Chain is not connected.</p>)
  }else if(!(api.tx) || (!api.tx.contract && !api.tx.contracts) ) {
    return (<p>No contract module in this chain.</p>)
  }else {
    return (<>
      <p>Able to use contract module.</p>
      {(!!abi&&!!wasm)
        ?<PutCodeModalButton api={api} abi={abi} wasm={wasm} codes={codes} setCodes={setCodes} />
        :[]
      }
    {Object.keys(codes).length>0?
      (!api.tx.hasOwnProperty('operator')
      ?<InstantiateModalButton
          api={api}
          codes={codes}
          instances={instances}
          setInstances={setInstances}
          selectedChain={selectedChain}
      />
      :<PlasmInstantiateModalButton
          api={api}
          codes={codes}
          instances={instances}
          setInstances={setInstances}
          selectedChain={selectedChain}
      />)
    :[]}
    {Object.keys(instances).length>0?<CallContractModalButton
        api={api}
        codes={codes}
        instances={instances}
        selectedChain={selectedChain}
    />:[]}
    </>)
  }
}

export default ChainStatus
