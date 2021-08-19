import { useState,useEffect } from "react";
import {FontSizeOutlined,FontColorsOutlined,BoldOutlined,UnorderedListOutlined,ItalicOutlined  } from '@ant-design/icons';
export default  function Topbar(props) {
    const {app} = props;

    return <div className="topbar">
        <div className="page-title">
            OREditor DEMO
        </div>
        <div className="func-list">
            <FontColorsOutlined onClick={()=>{
                app.keyboard.execute('SetStyle',{color:"red"});
            }} />
            <FontSizeOutlined />
            <BoldOutlined />
            <ItalicOutlined />
            <UnorderedListOutlined />
        </div>
    </div>
}