import ReactDOM from 'react-dom';
import React,{useEffect,useState} from 'react';
import { Spin } from 'antd';
import OREditor from '../src';
import Topbar from './Topbar';
import './index.less';
const Main = ()=>{
    const [loading,setLoading] = useState(false)
    useEffect(()=>{
        window.editor =  new OREditor(document.querySelector("#ore"),{
            width:600
        })
        setLoading(true)
    },[])
    return <div className="ore-editor-page">
        <Spin spinning={!loading}>
            <Topbar app={window.editor} />
            <div id="ore"></div>
        </Spin>
        
    </div>
}
ReactDOM.render(<Main />,document.querySelector("#root"))
