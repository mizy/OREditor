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
        // 箭头span切换
    },[])

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
                            }}
                        />
                    }
                >
                    <FontColorsOutlined
                        style={{ color: style.color }}
                        onClick={() => {
                            app.keyboard.execute("SetStyle", {
                                color: style.color,
                            });
                        }}
                    />
                </Dropdown>
                <Dropdown
                    placement="bottomCenter"
                    overlay={<Menu onClick={({key})=>{
                        style.fontSize = key;
                        setStyle({...style})
                    }}>
                        {fontSizeEnum.map(item=>(
                            <Menu.Item key={item}>{item}px</Menu.Item>
                        ))}
                    </Menu>}>
                    <span><FontSizeOutlined />({style.fontSize})</span>
                </Dropdown>
                <BoldOutlined
                    onClick={() => {
                        app.keyboard.execute("SetStyle", {
                            fontWeight: "bold",
                        });
                    }}
                />
                <ItalicOutlined
                    onClick={() => {
                        app.keyboard.execute("SetStyle", {
                            fontStyle: "italic",
                        });
                    }}
                />
                <UnorderedListOutlined />
            </div>
        </div>
    );
}
