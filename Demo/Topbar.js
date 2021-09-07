import { useState, useEffect } from "react";
import {
    FontSizeOutlined,
    FontColorsOutlined,
    BoldOutlined,
    UnorderedListOutlined,
    ItalicOutlined,
} from "@ant-design/icons";
import { TwitterPicker } from "react-color";
import { Dropdown, Menu } from "antd";
const fontSizeEnum = [12,14,16,18,24,32,46,64];
export default function Topbar(props) { 
    const { app } = props;
    const [style, setStyle] = useState({
        fontSize:14
    });
    
    useEffect(()=>{
        if(!app)return
        app.on("focus",()=>{
            const {style:nowStyle} = app.page.renderer.activeComponent;
            for(let key in nowStyle){
                style[key] = nowStyle[key]
            }
            setStyle({...style})
        })
    },[app])

    const changeColor = ()=>{
        app.keyboard.execute("SetStyle", {
            color: style.color,
        });
    }
    return (
        <div className="topbar">
            <div className="page-title">OREditor DEMO</div>
            <div className="func-list">
                <Dropdown
                    placement="bottomCenter"
                    overlay={
                        <TwitterPicker
                            triangle="hide"
                            colors={['#000000', '#FFFFFF','#D9E3F0', '#F47373', '#697689', '#37D67A', '#2CCCE4', '#555555', '#dce775']}
                            color={style.color}
                            onChange={(value) => {
                                style.color = value.hex;
                                setStyle({ ...style });
                                changeColor();
                            }}
                        />
                    }
                >
                    <FontColorsOutlined
                        style={{ color: style.color }}
                        onClick={changeColor}
                    />
                </Dropdown>
                <Dropdown
                    placement="bottomCenter"
                    overlay={<Menu onClick={({key})=>{
                        style.fontSize = key;
                        setStyle({...style});
                        app.keyboard.execute("SetStyle", {
                            fontSize: parseFloat(style.fontSize),
                        });
                    }}>
                        {fontSizeEnum.map(item=>(
                            <Menu.Item key={item}>{item}px</Menu.Item>
                        ))}
                    </Menu>}>
                    <span><FontSizeOutlined />({style.fontSize})</span>
                </Dropdown>
                <BoldOutlined
                    className={style.fontWeight==="bold"?'active':"'"}
                    onClick={() => {
                        app.keyboard.execute("SetStyle", {
                            fontWeight: style.fontStyle!=="bold"?'bold':'normal',
                        });
                    }}
                />
                <ItalicOutlined
                    className={style.fontStyle==="italic"?'active':"'"}
                    onClick={() => {
                        app.keyboard.execute("SetStyle", {
                            fontStyle: style.fontStyle==="italic"?'unset':'italic',
                        });
                    }}
                />
                <UnorderedListOutlined />
            </div>
        </div>
    );
}
