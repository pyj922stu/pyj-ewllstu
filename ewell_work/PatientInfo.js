require('./PatientInfo.less');
import React from 'react';
import logic from './Logic.js';

import { Component } from 'refast';
import { Control } from 'react-keeper';
import { Form, Input, Row, Col, Button, Modal,Divider } from 'antd';
import RegExpInput from '../../components/regexp-input';
import consts from '../../utils/consts';
import commMethods from '../../utils/comm-methods';
import Photograph from '../../components/Photograph';
import DateInput from '../../components/date-input';
import MySelect from '../../components/my-select';
import InputHKID from '../../components/input-hkid';

import RemovePhoto from  '../../pages/patientConfirmPage/PageLogic';

const Option = MySelect.Option;
const FormItem = consts.FormItem;
const { IMAGE_URL } = require(`config/${ENV}.json`);
const { getMaxLenRule, getRequiredRule, getObjFieldValue, getNewCumcNo, getDocumentTypeValidates, getExactDobAndDateBirth, getDateBirthStrValidates, getAgeAndUnit} = commMethods;
/**
 * 功能：录入患者的基本信息
 */
class PatientInfo extends Component {
    static defaultProps = {
        tabColumnsLen: {},
        patientInfo: {},
        onRef: ()=>{}
    };
    constructor(props) {
        super(props,logic);
        this.state = {
            cumcNo: this.props.patientInfo.cumcNo,
            takePhotoShow: false,
            myDate: null,
            stamp: null,
            openPhoto: "2",
            photo:null,
            showBigImg:"close",
            documentVisible:false,
            result: [],
            exactDateDict:[],
            //patientInfo:{}
            removePhotoFlag:false,
           
            removePhotoShow:(this.props.patientInfo.image !="" && this.props.patientInfo.image != null && this.props.patientInfo.image!=undefined)?false:true,
        }
    }
   
    getNewCumcNo() {
        let { surname: lastName, givenName: firstName } = this.props.form.getFieldsValue(["surname", "givenName"]);
        if (firstName && lastName) {
            // getNewCumcNo.call(this, firstName, null, lastName);
        }
        this.searchPatient();
    }
    componentDidMount() {
        this.props.onRef(this);
        let { cumcNo, surname: firstName, givenName: lastName } = this.props.patientInfo;
        // if (!cumcNo && (firstName && lastName)) {
        //     this.getNewCumcNo();
        // }
        console.log(`患者基本信息`,this.props.patientInfo);
        this.dispatch("getDicts",["exactDateDict"], this);
        // this.dispatch("getDicts",['exactDateDict'],this);
        // //调用下载接口 下载图片. 直接访问前端接口  file-infra-ewell-dev.192.168.198.94.nip.io/file-server/fileId
        // let editFlag = this.props.editFlag;
        // if( editFlag ){
        //         this.setImageShow();
        // }
    }
    componentWillReceiveProps(nextProps){ //更新字段信息, 根据新字段 判断调用插入 还是 更新接口 .
        if(this.props.patientInfo.cumcNo != nextProps.patientInfo.cumcNo){
            this.setState({
                cumcNo: nextProps.patientInfo.cumcNo,
                removePhotoShow:(nextProps.patientInfo.image !="" && nextProps.patientInfo.image != null && nextProps.patientInfo.image!=undefined)?false:true,
            });
        }
    }

    handleOk() {
        this.setState({
            takePhotoShow: false,
        })
    }

    handleCancel() {
        //关闭摄像头
        this.setState({
            takePhotoShow: false,
        })
        this.Photograph.closePhoto();
    }

    takePhotoRead() {
        //打开摄像头
            console.log("走到：打开摄像头了");
            this.Photograph.liveVideo();
        // if( this.state.openPhoto != "1"){
            
        // }
       


        this.setState({
            openPhoto: "1",
            takePhotoShow: true,
        })
    }

    removePhoto(){
        // debugger;
      //点击移除照片
      this.props.patientInfo.img= null;
      this.setState({
        photo: null, //1.确定会影响页面拍照ui的改变 2.
                     //2. 是否影响拍照的判断 --从而走进 是否拍照的逻辑里？？？？
        removePhotoFlag:true,//点击remove按钮后，为true;重新拍照是否 再次设置为false????
        
        removePhotoShow:true,//改变移除按钮的disabled属性
        
      });
    const removePtFlag = this.state.removePhotoFlag;
    this.props.removePhotoProps(removePtFlag);

    }

    onRef = (ref) => {
        this.Photograph = ref
    }

    sendMessage(value) {
        //this.actionFun(value.photo);
        //关闭 弹窗  设置 数据
        //设置一个展示时间的数据..
        //画一张图片
        
        this.setState({
            photo: value.photo,
            takePhotoShow: false,
            myDate: this.formatDate(),
            stamp: value.stamp
        });
        this.props.loadImageToPro(value);
    }

    dataURLtoFile(dataurl, filename = 'file') {
        let arr = dataurl.split(',')
        let mime = arr[0].match(/:(.*?);/)[1]
        let suffix = mime.split('/')[1]
        let bstr = atob(arr[1])
        let n = bstr.length
        let u8arr = new Uint8Array(n)
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n)
        }
        return new File([u8arr], `${filename}.${suffix}`, {
            type: mime
        })
    }


    /**
    *Base64字符串转二进制
    */
    dataURLtoBlob(dataurl) {
        var arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {
            type: mime
        });
    }

    formatDate() {
        var date = new Date();
        var monthArr = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Spt", "Oct", "Nov", "Dec");
        var year = date.getFullYear(); //年
        var month = monthArr[date.getMonth()]; //月
        var ddate = date.getDate(); //日
        if (ddate % 10 < 1 || ddate % 10 > 3) {
            ddate = ddate;
        } else if (ddate % 10 == 1) {
            ddate = ddate;
        } else if (ddate % 10 == 2) {
            ddate = ddate;
        } else {
            ddate = ddate;
        }
        return ddate + "-" + month + "-" + year;
    }
    searchPatient(){
        let {getFieldsValue}=this.props.form;
        let {surname, givenName, sex, dateBirth} = getFieldsValue(["surname", "givenName", "sex", "dateBirth"]);
        if(surname && givenName && sex && dateBirth){
            this.props.onSearchPat({surname, givenName, sex, dateBirth})
        }
    }

    showBigImg(){
        this.setState({
            showBigImg: "show"
        })
    }
    handleCancelImg(){
        this.setState({
            showBigImg: "close"
        })
    }

    hoverHiddendiv(){
        this.setState({
            showBigImg: "close"
        })
    }

    hoverShowDiv(){
        this.setState({
            showBigImg: "show"
        })
    }
    // cjf documentModal函数
    searchDocument(){
        console.log("查询患者身份证是否相同.");
        let documentTypeCode = this.props.form.getFieldValue("documentTypeCode");
        let documentNumber = this.props.form.getFieldValue("documentNumber");
        if(documentNumber != null && documentTypeCode != null){
            // console.log("-----确认不为空-----",documentTypeCode,documentNumber);
            this.props.getPatientDetailByDocument({documentTypeCode, documentNumber})
        }
    }
    releaseSaveButton(){
        this.props.releaseSaveButtonCanOnclick();
    }

    onOk() {
        if( this.isEmpty(this.state.selected) ){
            message.info("select patient")
        } else {
            this.getPatVisitRecord(this.state.selected);
            // selected
            this.setState({
                visible: false
            })
        }
    }
    onCancel() {
        // 主页面重新显示所有数据
        this.setState({
            selected: {},
            visible: false
        })
        this.dispatch("getPatientByWardCode", this.wardCode ,this);

    }
    PrintCancel(){
        this.setState({
            visiblePrint: false
        })
    }

    render() {
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 5 },
        };
        const formItemLayout1 = {
            labelCol: { span: 1 },
            wrapperCol: { span: 5 },
        }
        let t = this;
        let { getFieldDecorator, getFieldValue, setFieldsValue } = this.props.form;
        let formValue = this.props.form.getFieldsValue();
        let {exactDateDict} = this.state;
        let { tabColumnsLen, patientInfo } = this.props;
        let { documentTypeDict, sexDict, maritalDict, nationalityDict, religionDict, languageDict } = this.props;
        let initExactDob = getObjFieldValue(patientInfo, "exactDob");
        let initDateBirth = getObjFieldValue(patientInfo, "dateBirth");
        initDateBirth = initDateBirth ? moment(initDateBirth) : null;
        let documentTypeCode = getFieldValue("documentTypeCode");
        let {age, ageUnit} = getAgeAndUnit(getFieldValue("dateBirth") || initDateBirth);
        console.log("render props:",this.props);
        console.log("state.photo-----:"+(this.state.photo));
        console.log("photo?判断------:"+((this.state.photo)?"false":"true"));
        console.log("patientINfo?imag------:"+this.props.patientInfo.image,this.state.removePhotoShow);
        // debugger;
        return (
            <Form layout="horizontal" className="item">
                <div className="tt">
                    <i className="label-prefix"></i>
                    Patient Information
                </div>
                <Modal
                    width={350}
                    height={400}
                    centered={true}
                    title="Take Photo"
                    visible={this.state.takePhotoShow}
                    footer={null}
                    forceRender={true}
                    maskClosable={false}
                    keyboard={false}
                    // onOk={this.handleOk.bind(this)}
                    onCancel={this.handleCancel.bind(this)}
                >
                    <Photograph onRef={this.onRef} sendMessage={this.sendMessage.bind(this)} />
                </Modal>
                <Modal
                    width={230}
                    height={400}
                    centered={true}
                    title="look"
                    visible={this.state.showBigImg == "show"}
                    footer={null}
                    mask={false}
                    centered={true}
                    forceRender={true}
                    // onOk={this.handleOk.bind(this)}
                    onCancel={this.handleCancelImg.bind(this)}  >
                    <img  id="patientImage" src={this.state.photo} width="200px" height="300px" onClick={this.showBigImg.bind(this)}
                                       style={{  display: this.state.photo ? "":"none"  }} ></img>
                     <img  id="fsfaef" src={ patientInfo.image == null ? "":`${IMAGE_URL || ""}/file-server/${patientInfo.image}` } width="200px" height="300px" onClick={this.showBigImg.bind(this)}
                                      style={{  display: this.props.editFlag ? ((patientInfo.image && patientInfo.image != "fail") ? ( this.state.stamp=="stamp" ? "none" : ( this.state.photo ? "none":"")):"none" ):(patientInfo.image != null && patientInfo.image != "" && patientInfo.image != undefined ? (this.state.stamp=="stamp" ? "none":""):"none"  )  }}
                                    >
                         </img>
                </Modal>
                <Row>
                    <Col span={24} xxl={{span: 21}}>
                        <Row class="ant-Row1">
                                <Col span={6} push={2}  class="ant-c">
                                <FormItem class="photoItem"  style={{ lineHeight: "20px"}} label={<div className='label center photo'><br/>Photo   </div>}
                                     {...formItemLayout} >
                                    <img  id="patientImage" src={this.state.photo} width="30px" height="35px" onClick={this.showBigImg.bind(this)}
                                      style={{  display: this.state.photo ? "":"none"  }} >
                                    </img>
                                    <img  id="fsfaef" src={ patientInfo.image == null ? "":`${IMAGE_URL || ""}/file-server/${ (patientInfo.image !="" && patientInfo.image != null && patientInfo.image != undefined ) ? patientInfo.image:"" }`} width="30px" height="35px" onClick={this.showBigImg.bind(this)}
                                      style={{ display: this.props.editFlag ? ((patientInfo.image && patientInfo.image != "fail" && patientInfo.image != undefined ) ? ( this.state.stamp=="stamp" ? "none" : ( this.state.photo ? "none":"")):"none" ):(patientInfo.image != null && patientInfo.image != "" && patientInfo.image != undefined ? (this.state.stamp=="stamp" ? "none":""):"none"  )  }}
                                    >
                                    </img>
                                </FormItem>
                            </Col>
                            <Col  span={6} pull={2} style={{ display: this.state.photo ? "" : "none", height: "50px", lineHeight: "15px", marginTop: "-5px"  }} >
                                <div style={{ marginLeft: "-15px",width:"340px"  }} >
                                    <br/>Taken on<Divider type="vertical" />{this.state.myDate}
                                </div>
                            </Col>
                            <Col span={6} pull={(this.state.photo) ? "4" : ((patientInfo.image != "fail" && patientInfo.image) ? "1":"2" )}>  
                                <Button style={{   marginTop: "0px",marginLeft: "-25px" }}
                                     class="btn-primary"
                                        type="primary"
                                        onClick={this.takePhotoRead.bind(this)}
                                       >
                                       
                                         Take Photo
                                </Button>

                                <Button style={{   marginTop: "0px",marginLeft: "10px" }}
                                     class="btn-primary"
                                        type="primary"
                                     disabled = {this.state.removePhotoShow}
                                      onClick={this.removePhoto.bind(this)}>
                                         Remove photo
                                </Button>


                                </Col>
                        </Row>
                        <Row>
                            <Col span={8}>
                                <FormItem label="CUMC No." required>
                                    {getFieldDecorator('cumcNo', {
                                        initialValue: this.state.cumcNo
                                    })(<Input disabled />)}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem label="First Name" required>
                                    {getFieldDecorator('givenName', {
                                        initialValue: getObjFieldValue(patientInfo, "givenName"),
                                        rules: [
                                            getRequiredRule("First Name"),
                                            getMaxLenRule("First Name", Math.floor(tabColumnsLen.givenName / 3)),
                                            {pattern: /^[A-Za-z ,'.]*$/, message: "The format is incorrect!"}
                                        ]
                                    })(<RegExpInput format="Aa " className="mgl-text-ellipsis" showTitle={true}  onBlur={patientInfo.id ? null :this.getNewCumcNo.bind(this)} />)}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem label="Last Name" required>
                                    {getFieldDecorator('surname', {
                                        initialValue: getObjFieldValue(patientInfo, "surname"),
                                        rules: [
                                            getRequiredRule("Last Name"),
                                            getMaxLenRule("Last Name", Math.floor(tabColumnsLen.surname / 3)),
                                            {pattern: /^[A-Za-z ,'.]*$/, message: "The format is incorrect!"}
                                        ]
                                    })(<RegExpInput format="AA"  className="mgl-text-ellipsis" showTitle={true}
                                    onBlur={patientInfo.id ? null :this.getNewCumcNo.bind(this)}
                                     />)}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={8}>
                                <FormItem label="Other Name">
                                    {getFieldDecorator('otherName', {
                                        initialValue: getObjFieldValue(patientInfo, "otherName"),
                                        rules: [getMaxLenRule("other name", Math.floor(tabColumnsLen.otherName / 3))]
                                    })(<Input />)}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem label={<div className='label center'>Name<br />in Chinese</div>} className="mgl-double-rows">
                                    {getFieldDecorator('nameChinese', {
                                        initialValue: getObjFieldValue(patientInfo, "nameChinese"),
                                        rules: [getMaxLenRule("chinese name", Math.floor(tabColumnsLen.nameChinese / 12)),
                                                {pattern: /^[\u4E00-\u9FA5\.\,\ ]+$/, message: "The format is incorrect!"}
                                        ]
                                    })(<Input />)}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem label="Sex">
                                    {getFieldDecorator('sex', {
                                        initialValue: getObjFieldValue(patientInfo, "sex"),
                                        rules: [getRequiredRule("Sex")]
                                    })(<MySelect showSearch placeholder={"Select Sex"} onBlur={this.searchPatient.bind(this)}>
                                        {
                                            sexDict && sexDict.map((item) => {
                                                return (
                                                    <Option value={item.code} show={item.name}>{item.name}</Option>
                                                )
                                            })
                                        }
                                    </MySelect>)}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={8}>
                                <FormItem label="Date of Birth" required>
                                    {getFieldDecorator('exactDob', {
                                        initialValue: initExactDob
                                    })}
                                    {getFieldDecorator('dateBirth', {
                                        initialValue: initDateBirth
                                    })}
                                    {getFieldDecorator('dateBirthStr', {
                                        initialValue: initDateBirth?initDateBirth.format(consts.ExactDobInputFormat[initExactDob]):null,
                                        validateFirst: true,
                                        rules: [getRequiredRule("Date of Birth")],
                                        validate: getDateBirthStrValidates()
                                    })(
                                        <DateInput allowClear onBlur={(e)=>{
                                            let {exactDob, dateBirth} = getExactDobAndDateBirth(e.target.value);
                                            if(dateBirth){
                                                exactDateDict && exactDateDict.map((item)=>{
                                                    if(item.code== exactDob){
                                                    let dobformat=item.code;
                                                    console.log("zidian",item);
                                                    setFieldsValue({ 
                                                        dobformat:dobformat
                                                     });
                                                    }
                                                })
                                                //用字段解析翻译一下. 原代码不变,新窗口显示.
                                                setFieldsValue({ exactDob, dateBirth });
                                                this.searchPatient();
                                            }else{
                                                setFieldsValue({
                                                    exactDob: null,
                                                    dateBirth: null,
                                                });
                                            }
                                        }}/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem label="DOB">
                                    {getFieldDecorator('dobformat', {
                                        initialValue: initExactDob
                                    })(<MySelect disabled >
                                        {
                                            exactDateDict && exactDateDict.map((item) => {
                                                return (
                                                    <Option value={item.code} show={item.code}>{item.code}</Option>
                                                )
                                            })
                                        }
                                    </MySelect>)}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem label="Age">
                                    <Input.Group compact>
                                        <Input disabled value={age} style={{ width: '70%' }} />
                                        <Input disabled value={ageUnit} style={{ width: '30%' }} />
                                    </Input.Group>
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                        <Col span={8}>
                                <FormItem label="Document Type" required>
                                    {getFieldDecorator('documentTypeCode', {
                                        initialValue: getObjFieldValue(patientInfo, "documentTypeCode")||"ID",
                                        rules: [getRequiredRule("Document Type")]
                                    })(<MySelect
                                        placeholder="Select Document Type"
                                        onBlur={this.searchDocument.bind(this)}
                                        onChange={this.releaseSaveButton.bind(this)}
                                    >
                                        {
                                            documentTypeDict && documentTypeDict.map((item) => {
                                                return (
                                                    <Option value={item.code} show={item.name}>{item.name}</Option>
                                                )
                                            })
                                        }
                                    </MySelect>)}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem label="Document No." required>
                                    {getFieldDecorator('documentNumber', {
                                        initialValue: getObjFieldValue(patientInfo, "documentNumber"),
                                        validateFirst: true,
                                        rules: [
                                            getRequiredRule("Document No."),
                                            getMaxLenRule("Document No.", Math.floor(tabColumnsLen.documentNumber / 3))
                                        ].concat(documentTypeCode === "ID"?[getRequiredRule("Document No.")]:[]),
                                        validate: getDocumentTypeValidates(getFieldValue("documentTypeCode")),
                                    })(
                                        documentTypeCode !== "ID"?
                                        <Input
                                        onBlur ={this.searchDocument.bind(this)}
                                        onChange={this.releaseSaveButton.bind(this)} //修改  状态为 可以保存. 这个方法永远先触发,
                                        placeholder="Input Document No." />
                                        : <InputHKID 
                                            onBlur ={this.searchDocument.bind(this)}
                                            onChange={this.releaseSaveButton.bind(this)} //修改  状态为 可以保存. 这个方法永远先触发,
                                            placeholder="eg:E364912(5) or EA123445(8)"
                                        />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem label="Nationality">
                                    {getFieldDecorator('nationalityCode', {
                                        initialValue: getObjFieldValue(patientInfo, "nationalityCode")
                                    })(<MySelect showSearch allowClear
                                        placeholder="Select Nationality"
                                    >
                                        {
                                            nationalityDict && nationalityDict.map((item) => {
                                                return (
                                                    <Option value={item.code} show={item.name}>{item.name}</Option>
                                                )
                                            })
                                        }
                                    </MySelect>)}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={8}>
                                <FormItem label="Marital Status">
                                    {
                                        getFieldDecorator('maritalStateCode', {
                                            initialValue: getObjFieldValue(patientInfo, "maritalStateCode")
                                        })(<MySelect showSearch allowClear
                                            placeholder="Select Marital Status"
                                        >
                                            {
                                                maritalDict && maritalDict.map((item) => {
                                                    return (
                                                        <Option value={item.code} show={item.name}>{item.name}</Option>
                                                    )
                                                })
                                            }
                                        </MySelect>)}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem label="Religion">
                                    {getFieldDecorator('religionCode', {
                                        initialValue: getObjFieldValue(patientInfo, "religionCode")
                                    })(<MySelect showSearch allowClear
                                        placeholder="Select Religion"
                                    >
                                        {
                                            religionDict && religionDict.map((item) => {
                                                return (
                                                    <Option value={item.code} show={item.name}>{item.name}</Option>
                                                )
                                            })
                                        }
                                    </MySelect>)}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="mgl-double-rows" label={<div className="label right">Preferred<br />Language</div>}>
                                    {getFieldDecorator('preferredLanguage', {
                                        initialValue: getObjFieldValue(patientInfo, "preferredLanguage")
                                    })(<MySelect showSearch allowClear
                                        placeholder="Select Preferred Language"
                                    >
                                        {
                                            languageDict && languageDict.map((item) => {
                                                return (
                                                    <Option value={item.code} show={item.name}>{item.name}</Option>
                                                )
                                            })
                                        }
                                    </MySelect>)}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <FormItem label="Remarks" labelCol={{ span: 3 }} wrapperCol={{ span: 20 }}>
                                    {getFieldDecorator('remarks', {
                                        initialValue: getObjFieldValue(patientInfo, "remarks"),
                                        rules: [getMaxLenRule("remarks", Math.floor(tabColumnsLen.remarks / 3 * 2.5))]
                                    })(<Input.TextArea />)}
                                </FormItem>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Form>
        );
    }
}

export default Form.create()(PatientInfo);