'use client'
import React, { createContext, useState, useContext, useEffect, } from 'react';
import { ProviderProps, IAnalysisUrl, AnalysisParams, IAnalysis } from '@/app/types';
import { StorageKeys } from '../constants/global';
import {LocalStorage} from "@/app/lib/storage"
import * as ChartwiseClient from '../lib/requests/chartwise-client';
import { RetryHandler } from 'devtilities';
import { formatAnalyses, getAnalysisName } from '../lib/helpers';
import { getAnalyses } from '../lib/data/analysis';


interface TradeContextProps {
  recentAnalyses: IAnalysisUrl[];
  setRecentAnalyses: React.Dispatch<React.SetStateAction<IAnalysisUrl[]>>; 
  analysis: Omit<IAnalysis, 'userId'>; 
  setAnalysis: React.Dispatch<React.SetStateAction<Omit<IAnalysis, 'userId'>>>; 
  shareUrl: string | null, 
  setShareUrl:  React.Dispatch<React.SetStateAction<string | null>>;
}

const ChartwiseContext = createContext<TradeContextProps | undefined>(undefined);
const retryHandler = new RetryHandler(1); // Allow only 1 retry to handle expired token


const DefaultAnalysis: Omit<IAnalysis, 'userId'> = {
  name: '',
  output: '',
  chartUrls: [],
  metadata:{
    risk: 25,
    strategyAndCriteria: ''
  }
}

const ChartwiseProvider = ({ children, email }: ProviderProps & {email: string | null | undefined}) => {
  const [recentAnalyses, setRecentAnalyses] = useState<IAnalysisUrl[]>([]);
  const [analysis, setAnalysis] = useState<Omit<IAnalysis, 'userId'>>(DefaultAnalysis);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentAnalysis = async(email: string) => {
      const analyses = await getAnalyses(email)
      const fetchedFormattedAnalysis = formatAnalyses(analyses);
      LocalStorage.set(StorageKeys.recentAnalyses, JSON.stringify(fetchedFormattedAnalysis));
      setRecentAnalyses(fetchedFormattedAnalysis);
    }

    const cachedAnalyses = LocalStorage.get(StorageKeys.recentAnalyses);
    if (Array.isArray(cachedAnalyses)) {
    setRecentAnalyses(cachedAnalyses);
    }else{
      if(!email) return;
      fetchRecentAnalysis(email)
    }
  },[])

  useEffect(() => {
    const saveAnalysis = async() => {
      const addRecentAnalysis = (analysisUrlFormat: IAnalysisUrl) => {
        LocalStorage.append(StorageKeys.recentAnalyses, analysisUrlFormat);
        setRecentAnalyses(prevAnalyses => [...prevAnalyses, analysisUrlFormat])
      }
      if(analysis.chartUrls.length > 0 && analysis.output){
        const url = await ChartwiseClient.saveAnalysis(analysis);
        if(url){
          setShareUrl(url);
          addRecentAnalysis({name: analysis.name, analyseUrl: url});
        }
      }
    }
   saveAnalysis()
  }, [analysis.output]);


  return (
    <ChartwiseContext.Provider value={{ 
      recentAnalyses, 
      setRecentAnalyses,
      analysis,
      setAnalysis,
      shareUrl, 
      setShareUrl,
      }}>
      {children}
    </ChartwiseContext.Provider>
  );
};

const useChartwise = () => {
  const context = useContext(ChartwiseContext);
  if (!context) {
    throw new Error('useChartwise must be used within a ChartwiseProvider');
  }
  const {
    recentAnalyses,
    setRecentAnalyses,
    analysis,
    setAnalysis,
    shareUrl,
  } = context;


const deleteAnalysis = (analysis: IAnalysisUrl) => {
  LocalStorage.removeItemFromArray(StorageKeys.recentAnalyses, (storedAnaysis: IAnalysisUrl) => storedAnaysis.name!== analysis.name);
  setRecentAnalyses(prevAnalyses => prevAnalyses.filter((storedAnaysis: IAnalysisUrl) => storedAnaysis.name!== analysis.name))
}


const removeAnalysis = () => {
    setAnalysis(prevAnalysis => ({...prevAnalysis, output: ''}))
  }
  
const onStrategyChange = (strategy: string) => {
  setAnalysis(prevAnalysis => ({...prevAnalysis, metadata: {...prevAnalysis.metadata, strategyAndCriteria: prevAnalysis.metadata.strategyAndCriteria === strategy? '':strategy}}))
};

const onRiskChange = (newRisk: number) => {
  setAnalysis(prevAnalysis => ({...prevAnalysis, metadata: {...prevAnalysis.metadata, risk: newRisk}}))
};

const onNameChnage = (newName: string) => {
  setAnalysis(prevAnalysis => ({...prevAnalysis, name: newName}))
};

const removeCharts = () => {
    setAnalysis(prevAnalysis => ({...prevAnalysis, chartUrls: []}))
    removeAnalysis();
};

const uploadCharts = async (files: File[]) => {
  const analysisName = getAnalysisName(files[0]?.name);
  onNameChnage(analysisName);
  const fileReaders = files.map(file => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        reject(new Error('File reading has failed'));
      };
      reader.readAsDataURL(file);
    });
  });

  try {
    const urls = await Promise.all(fileReaders);
    setAnalysis(prevAnalysis => ({...prevAnalysis, chartUrls: urls}))
  } catch (error) {
    console.error('Failed to read files:', error);
  }
};


const getRiskTolerance = () => {
  switch(true){
    case analysis.metadata?.risk! <= 0.33 * 100:
      return 'Low risk';
    case analysis.metadata?.risk! <= 0.66 * 100 && analysis.metadata?.risk! > 0.33 * 100:
      return 'Med risk';
    case analysis.metadata?.risk! > 0.66 * 100:
      return 'High risk';
    default:
      return 'Risk';
  }
}


const analyseChart = async (analysis: AnalysisParams, userId: string) => {
    try {
      const jobReceipt = await retryHandler.retry(
        async () => await ChartwiseClient.submitAnalysisRequest(analysis),
        async(error)=> await ChartwiseClient.refreshOnError(error as Error, userId)
      );
      return jobReceipt;
    } catch (error) {
      throw error;
    }
  };

  const newAnalysis = () => {
   setAnalysis(DefaultAnalysis)
  }

  const onAnalysisComplete = (output: string) => {
    setAnalysis(prevAnalysis => ({...prevAnalysis, output}))
    LocalStorage.remove(StorageKeys.jobId);
  }



  return {
    analysis,
    recentAnalyses,
    shareUrl,
    newAnalysis,
    deleteAnalysis,
    removeAnalysis,
    analyseChart,
    removeCharts,
    onStrategyChange,
    onAnalysisComplete,
    onRiskChange,
    getRiskTolerance,
    uploadCharts,
    onNameChnage
  };
};

export { ChartwiseContext, ChartwiseProvider, useChartwise };