'use client'
import { AcceptedImgFiles, AcceptedImgMimes } from "@/app/constants/app";
import {FileUploader} from "@/app/ui/";
import {faPaperclip, faSearch, faTimes, faWarning } from "@fortawesome/free-solid-svg-icons";
import Chart from "./chart";
import { useUser } from "@auth0/nextjs-auth0/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {SliderInput} from "@/app/ui";
import { useChartwise } from "@/app/providers/chartwise";
import { analyseChartSchema } from "@/app/constants/schemas";



interface AnalysisFormProps {
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
    handleJobInProgress: (jobId: string) => void;
    handleFailedJobStart: (error: Error) => void;
  }


  export default function AnalysisForm ({handleJobInProgress, handleFailedJobStart, loading, setLoading}: AnalysisFormProps){
    const MAX_CHARS = 150;
    const {anaylsisParams, analysisResult, chartImageUrl, strategyAndCriteria, risk, handleRiskChange, handleStrategyAndCriteriaChange, getRiskTolerance, setChartAnalysisResult, analyseChart,  removeChart, uploadChart} = useChartwise();

    const AnalysisActionRow = () => {
        const {user} = useUser();
        const userId = user?.email;
    
    
        const handleAnalyseChart = async () => {
            if(!userId || !chartImageUrl)return;
            if(analysisResult){
              setChartAnalysisResult(null);
            }
            setLoading(true);
        
            const formData = new FormData();
            const validatedAnalysis = analyseChartSchema.safeParse(anaylsisParams);
            if(!validatedAnalysis.success)throw new Error(JSON.stringify(validatedAnalysis.error))
            formData.append('analysis', JSON.stringify(validatedAnalysis.data));
        
            try {
              const jobId = await analyseChart(userId, formData);
              handleJobInProgress(jobId);
            } catch (error: any) {
              handleFailedJobStart(error)
            }
        };
    
        return(
          <div className="w-full flex flex-row justify-start items-center gap-3 rounded-md mt-4 h-10">
          <div className="">
          <FileUploader onFileUpload={uploadChart} acceptedFileExt={AcceptedImgFiles} acceptedMimes={AcceptedImgMimes}>
            <div className='flex flex-row gap-1 justify-center items-center'>
              <FontAwesomeIcon icon={faPaperclip} className="w-4 h-4" />
              <span className="">Upload Chart</span>
            </div>
          </FileUploader>
          </div>
        
          <button
            disabled={loading || !userId || !chartImageUrl}
            className={`flex  items-center justify-center border-2 border-2 border-emerald-400 bg-emerald-700 text-sm  ml-auto text-white font-semibold p-2 rounded-full shadow-md gap-2 ${loading || !userId || !chartImageUrl? 'opacity-50' : 'opacity-100 hover:bg-emerald-500'}`}
            onClick={handleAnalyseChart}
          >
            <FontAwesomeIcon icon={faSearch} className="w-4 h-4"/>
            {/* <AnalysisIcon/> */}
            <span className="">Analyse Chart</span>
          </button>
        </div>
        )
      }
    
    return (
      <div className="relative w-full max-w-[100%] flex flex-col bg-gray-800 border-2 border-gray-700 text-sm md:text-md lg:text-lg shadow-md rounded-md mb-2 p-4" >
        <div className="flex flex-row justify-between">
          <label htmlFor={'strategy-criteria'} className=" flex flex-row block text-left font-medium mb-1 text-gray-200">
            {`Strategy and Criteria (optional):`}
          </label>      
        </div>
        <div className="flex flex-col items-center mb-4 w-full bg-gray-800 rounded-md border border-gray-700 text-sm md:text-md lg:text-lg ">
        <textarea
          id={"strategy-criteria"}
          name={"strategy-criteria"}
          placeholder={"To optimise your analysis, provide details about your trading strategy (e.g., breakout, swing trading) and any criteria like minimum risk-to-reward ratio. Be specific."}
          className={`flex w-full  flex-grow min-h-[180px] lg:min-h-[100px] p-2 bg-transparent rounded-md focus:outline-none resize-none text-sm md:text-md lg:text-lg`}
          value={strategyAndCriteria}
          onChange={handleStrategyAndCriteriaChange}
          aria-describedby={"strategy-criteria-error"}
          maxLength={MAX_CHARS} />
          <span className="p-2 w-full text-right text-gray-400">{`${strategyAndCriteria.length}/${MAX_CHARS}`}</span> 
        </div>
       
          
        <div className="flex lg:flex-row flex-col justify-between items-center gap-16 my-4 pb-20">
          <div className="mb-auto w-full lg:w-[50%]">
            <SliderInput
              title={getRiskTolerance()}
              description="Adjust your risk tolerance"
              icon={faWarning}
              min={0}
              max={100}
              initialValue={risk}
              onChange={handleRiskChange}/>
            </div>
          {chartImageUrl && (
          <div className="relative mb-auto w-full lg:w-[50%] mt-4">
          <button 
      className="absolute top-0 right-0 mt-2  text-red-600 transform -translate-y-8 z-[40]"
      onClick={removeChart}
          >
            <FontAwesomeIcon icon={faTimes} className="w-4 h-4"/>
          </button>
          <Chart chartImageUrl={chartImageUrl} loading={loading} />
        </div>
          )}
        </div>
        <div className="absolute bottom-0 right-0 left-0 w-full  bg-gray-900 border-t-2 border-gray-700 pb-4 px-4 rounded-md">
        <AnalysisActionRow/>
        </div>
    </div>
    )
  }