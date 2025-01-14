import React, {useEffect, useRef, useState } from 'react';
import ResizeObserver from 'rc-resize-observer';
import { Layout, Button, Space,  Select, Modal, Input } from 'antd';
import { DeleteTwoTone } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import Editor from "@monaco-editor/react";
import moment from 'moment';

import Graph from './components/AntVGraphin'
import Logger from './util/Logger'
import Footer from './components/Footer';
import {getAST, getRunningResult} from './services'
import {Examples} from './etc/ExampleCode'
import Convert from 'ansi-to-html';
import parse from 'html-react-parser';

import '@ant-design/pro-card/dist/card.css';
import '@ant-design/pro-layout/dist/layout.css';
import './App.css'

const { TextArea } = Input;
const { Header, Content } = Layout;
const { Option } = Select;
const convert = new Convert({newline: true})

function App() {
  const graphRef = useRef(null)
  const editorRef = useRef(null)
  const inputRef = useRef(null)
  const bottomRef = useRef(null)
  const [data, setData] = useState({id: '1', label: 'c-compiler', type: 'circle'})
  const [output, setOutput] = useState("<span><h3>[INFO] Welcome to c-compiler</h3></span>")
  const [horizontal, setHorizontal] = useState(false)
  const logger = new Logger(output, setOutput)
  
  useEffect(()=>{
    bottomRef.current.scrollIntoView({ behavior: 'smooth' })
  },[output])

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    editorRef.current.setValue(Examples[0].code)
  }
  
  const handleCompile = async () =>{
    var code = editorRef.current.getValue()
    try {
      let resp = await getAST("#include \"builtin.h\"\n"+code)
      logger.Debug(JSON.stringify(resp))
      if(resp.success){
        logger.Info('Compile Success\n')
        setData(resp.data)
      }
    } catch (error) {
      if(error.response){
        var htmltext = "<div style=\"fontFamily:courier\">"+convert.toHtml(error.response.data)+"</div>"
        logger.Error('Compile Error!'+htmltext)
        Modal.error({
          title: 'Compile Error !',
          closable: true,
          okButtonProps:{
            style:{backgroundColor:'#F00000',borderColor:'#F00000'}
          },
          okType: 'primary',
          content: parse(htmltext),
          centered:true,
          width: 'max-content',
          bodyStyle:{
            overflowWrap:'normal',
          },
          afterClose:()=>{
            bottomRef.current.scrollIntoView({ behavior: 'smooth' })
          }
        })
      }
    }
  }

  const handleChange = (value) => {
    editorRef.current.setValue(Examples[value-1].code)
  }

  const handleSave = () => {
    graphRef.current.Save()
  }
  
  const handleRefresh = () => {
    graphRef.current.Refresh()
  }

  const handleRunCode = async () => {
    var code = editorRef.current.getValue()
    var input = inputRef.current.resizableTextArea.props.value
    try {
      let resp = await getRunningResult({
        code : "#include \"builtin.h\"\n"+code,
        input: input
      })
      logger.Debug(JSON.stringify(resp))
      if(resp.success){
        logger.Info("Run Success\n" + convert.toHtml(resp.data))
      }
    } catch (error) {
        if(error.response){
          var htmltext = "<div style=\"fontFamily:courier\">"+convert.toHtml(error.response.data)+"</div>"
          logger.Error('Run Error !'+htmltext)
          Modal.error({
            title: 'Run Code Error!',
            closable: true,
            okButtonProps:{
              style:{backgroundColor:'#F00000',borderColor:'#F00000'}
            },
            okType: 'primary',
            content: parse(htmltext),
            centered:true,
            width: 'max-content',
            bodyStyle:{
              overflowWrap:'normal',
            },
            afterClose:()=>{
              bottomRef.current.scrollIntoView({ behavior: 'smooth' })
            }
        })
      }
    }
  }

    return (
      <ResizeObserver onResize={({ width, height }) => {
        if(width < 600)
          setHorizontal(true)
        else
          setHorizontal(false)
      }}>
      <Layout style={{minHeight:'100vh'}}>
         <Header>
         </Header>
         <Content
          style={{
            padding: "20px 20px 0px 20px",
          }}
         >
          <ProCard
            className='card'
            title="Web IDE"
            extra={moment(new Date()).format("YYYY-MM-DD")}
            split={horizontal ? 'horizontal':'vertical'} 
            bordered
            headerBordered
            bodyStyle={{
              minHeight: '70vh'
            }}
          >
            <ProCard title="Editor"
              className='card'
              extra={
                <Space>
                  <Select defaultValue={1} onChange={handleChange} dropdownStyle={{width:'max-content'}} dropdownMatchSelectWidth={false} >
                    {Examples.map(element => <Option key={element.id} value={element.id}>{element.name}</Option>)}
                  </Select>
                  <Button type="primary" onClick={handleCompile}>Compile</Button>
                </Space>
              }
              colSpan={horizontal ? "100%":"32%"}
              bodyStyle={{height:horizontal ?'50vh':'100%'}}
            >
            <Editor
                defaultLanguage='c'
                onMount={handleEditorDidMount}
                options={{
                  minimap:{ // 关闭代码缩略图
                    enabled: false,
                  }
                }}
            />
            </ProCard>
            <ProCard title="Abstract Syntax Tree" 
                className='card' 
                extra={
                  <Space>
                    <Button type="primary" onClick={handleSave}>Save</Button>
                    <Button type="primary" onClick={handleRefresh}>Refresh</Button>
                  </Space>
                }
                colSpan={horizontal ? "100%":"38%"}
              >
            <Graph ref={graphRef} data={data}></Graph>
            </ProCard>
            <ProCard title="Log" subTitle="Running Result" 
              className='card' 
              colSpan={horizontal ? "100%":"30%"}
              extra={
                <Button type="primary" onClick={handleRunCode}>Run Code</Button>
              }
              bodyStyle={
                {whiteSpace: 'pre-line', overflow:'auto', maxHeight: '85vh', fontFamily: 'consolas,monospace'}
              }
              >
                <TextArea
                  bordered={true}
                  allowClear={true}
                  rows={5}
                  placeholder="Input:"
                  height="50%"
                  ref={inputRef}
                />
                {
                  parse(output)
                }
                <div  ref={bottomRef}></div>
                <Button type= "default" shape="circle" icon={<DeleteTwoTone />} 
                  style={{
                    position:'absolute',
                    right: '4%',
                    bottom: '2%'
                  }}
                  onClick={
                    ()=>{
                      setOutput("")
                    }
                  }
                />
            </ProCard>
          </ProCard>
        </Content>
        <Footer/>
        </Layout>
      </ResizeObserver>
  );
}

export default App;