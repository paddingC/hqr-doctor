/* eslint-disable require-jsdoc */
import {Message} from 'element-ui'
import TRTC      from 'trtc-js-sdk'
import axios from 'axios'
import store          from './../store'
import router         from 'vue-router'
export default class RtcClient {
    constructor(options) {
        this.sdkAppId_ = options.sdkAppId
        this.userId_ = options.userId
        this.userSig_ = options.userSig
        this.roomId_ = options.roomId
        this.isJoined_ = false
        this.isPublished_ = false
        this.localStream_ = null
        this.remoteStreams_ = []
        this.record = {
            userid1: options.record.userid1,
            companyid: options.record.companyid,
            userid2: options.record.userid2 ,
            roomid: options.record.roomid,
            billtype: options.record.billtype,
            billid: options.record.billid
        }
        this.liuState = {
            roomid: options.record.roomid,
            userid1: options.record.userid1,
            userid2: options.record.userid2,
            companyid: options.record.companyid,
        }
        // check if browser is compatible with TRTC
        TRTC.checkSystemRequirements().then(result => {
            if (!result) {
                alert('Your browser is not compatible with TRTC! Please download Chrome M72+')
            }
        })
    }

    async join() {
        if (this.isJoined_) {
            console.warn('duplicate RtcClient.join() observed')
            return
        }

        // create a client for RtcClient
        this.client_ = TRTC.createClient({
            mode: 'videoCall', // 实时通话模式
            sdkAppId: this.sdkAppId_,
            userId: this.userId_,
            userSig: this.userSig_
        })

        // 处理 client 事件
        this.handleEvents()

        try {
            // join the room
            await this.client_.join({roomId: this.roomId_})
            console.log('join room success')
            // Message.success('进房成功！')
            this.isJoined_ = true
        } catch (error) {
            console.error('failed to join room because: ' + error)
            // alert(
            //     '进房失败原因：' + error)
            // // Message.error('进房错误！')
            return
        }

        try {
            // 采集摄像头和麦克风视频流
            await this.createLocalStream({audio: true, video: true})
            // Message.info('摄像头及麦克风采集成功！')
            store.commit('app/SET_SGEBEI', true)
            store.dispatch('app/savelog', {userid: this.userId_, msg: '摄像头及麦克风采集成功'}).then(res=>{
                console.log(res);
            }).catch(err=>{
                console.log(err);
            })
        } catch (error) {
            store.dispatch('app/savelog', {userid: this.userId_, msg: '摄像头和麦克风未授予其访问权限'}).then(res=>{
                console.log(res);
            }).catch(err=>{
                console.log(err);
            })
            store.commit('app/SET_CELLFLASE', false)
            store.commit('app/SET_SGEBEI', false)
            alert ('请检查您的设备是否正常');
            await this.leave()
            return
            // try {
            //     // fallback to capture camera only
            //     await this.createLocalStream({audio: false, video: true})
            //     // Message.info('采集摄像头成功！')
            // } catch (error) {
            //     console.error('createLocalStream with video failed: ' + error)
            //     return
            // }
        }
        this.localStream_.on('player-state-changed', event => {
            console.log(`local stream ${event.type} player is ${event.state}`)
            if (event.type === 'video' && event.state === 'PLAYING') {
                // dismiss the remote user UI placeholder
            } else if (event.type === 'video' && event.state === 'STOPPPED') {
                // show the remote user UI placeholder
            }
        })

        await this.publish()
        // Message.success('发布本地流成功！')
        // 在名为 ‘local_stream’ 的 div 容器上播放本地音视频
        this.localStream_.play('local_stream')
        // publish local stream by default after join the room
    }
    async leave() {
        if (!this.isJoined_) {
            console.warn('leave() - leave without join()d observed')
            // Message.error('请先加入房间！')
            return
        }

        if (this.isPublished_) {
            // ensure the local stream has been unpublished before leaving.
            await this.unpublish(true)
        }

        try {
            // leave the room
            await this.client_.leave()
            //Message.success('退房成功！')
            this.isJoined_ = false
        } catch (error) {
            console.error('failed to leave the room because ' + error)
            location.reload()
        } finally {
            // 停止本地流，关闭本地流内部的音视频播放器
            this.localStream_.stop()
            // 关闭本地流，释放摄像头和麦克风访问权限
            this.localStream_.close()
            this.localStream_ = null
        }
    }

    async publish() {
        if (!this.isJoined_) {
            // Message.error('请先加入房间再点击开始推流！')
            console.warn('publish() - please join() firstly')
            return
        }
        if (this.isPublished_) {
            console.warn('duplicate RtcClient.publish() observed')
            // Message.error('当前正在推流！')
            return
        }
        try {
            // 发布本地流
            await this.client_.publish(this.localStream_)
            // Message.info('发布本地流成功！')
            this.isPublished_ = true
            // 本地流发布成功后对药师端进行视频录制


        } catch (error) {
            console.error('failed to publish local stream ' + error)
            // Message.error('发布本地流失败！')
            this.isPublished_ = false
        }
        this.isPublished_ = true
    }

    async unpublish(isLeaving) {
        if (!this.isJoined_) {
            console.warn('unpublish() - please join() firstly')
            // Message.error('请先加入房间再停止推流！')
            return
        }
        if (!this.isPublished_) {
            console.warn('RtcClient.unpublish() called but not published yet')
            // Message.error('当前尚未发布本地流！')
            return
        }

        try {
            // 停止发布本地流
            await this.client_.unpublish(this.localStream_)
            this.isPublished_ = false
            // Message.info('停止发布本地流成功！')
            console.log('停止发布本地流成功');
        } catch (error) {
            console.error('failed to unpublish local stream because ' + error)
            // Message.error('停止发布本地流失败！')
            console.log('停止发布本地流失败');
            if (!isLeaving) {
                console.warn('leaving the room because unpublish failure observed')
                // Message.error('停止发布本地流失败，退出房间！')
                console.log('停止发布本地流失败，退出房间');
                this.leave()
            }
        }
    }
    async createLocalStream(options) {
        this.localStream_ = TRTC.createStream({
            audio: options.audio, // 采集麦克风
            video: options.video, // 采集摄像头
            userId: this.userId_

            // cameraId: getCameraId(),
            // microphoneId: getMicrophoneId()
        })
        // 设置视频分辨率帧率和码率
        this.localStream_.setVideoProfile('480p')

        await this.localStream_.initialize()
    }

    handleEvents() {
        // 处理 client 错误事件，错误均为不可恢复错误，建议提示用户后刷新页面
        this.client_.on('error', err => {
            console.error(err)
            alert(err)
            // Message.error('客户端错误：' + err)
            // location.reload();
        })

        // 处理用户被踢事件，通常是因为房间内有同名用户引起，这种问题一般是应用层逻辑错误引起的
        // 应用层请尽量使用不同用户ID进房
        this.client_.on('client-banned', err => {
            console.error('client has been banned for ' + err)
            // Message.error('用户被踢出房间！')
            // location.reload();
        })

        // 远端用户进房通知 - 仅限主动推流用户
        this.client_.on('peer-join', evt => {
            const userId = evt.userId
            console.log('peer-join ' + userId)
            // Message.info('远端用户进房 - ' + userId)
            console.log('远端用户进房');
        })
        // 远端用户退房通知 - 仅限主动推流用户
        this.client_.on('peer-leave', evt => {
            const userId = evt.userId
            console.log('peer-leave ' + userId)
            // Message.success('远端用户退房 - ' + userId)
            console.log('远端用户退房');
        })

        // 处理远端流增加事件
        this.client_.on('stream-added', evt => {
            const remoteStream = evt.stream
            const id = remoteStream.getId()
            const userId = remoteStream.getUserId()

            // Message.info('远端流增加 - ' + userId)
            // 远端流默认已订阅所有音视频，此处可指定只订阅音频或者音视频，不能仅订阅视频。
            // 如果不想观看该路远端流，可调用 this.client_.unsubscribe(remoteStream) 取消订阅
            this.client_.subscribe(remoteStream)
        })

        let count = 0
        let timer = null
        // 远端流订阅成功事件
        this.client_.on('stream-subscribed', evt => {
            const remoteStream = evt.stream
            const id = remoteStream.getId()
            this.remoteStreams_.push(remoteStream)
            // 在指定的 div 容器上播放音视频
            remoteStream.play('remote_stream')

            // Message.info('远端流订阅成功 - ' + remoteStream.getUserId())
            console.log('远端流订阅成功');
            timer = setInterval(()=>{
                if (count >= 10){
                    clearInterval(timer)
                    return false
                }
                axios({
                    method: 'POST',
                    // url: 'https://yuntest.inca.com.cn/dzsf/tencentcloud/queryStreamState',
                    // url: 'https://dzsf.inca.com.cn/tencentcloud/queryStreamState',
                    url: 'https://yuntest.inca.com.cn/dzsf/tencentcloud/queryTowStreamState',
                    // url: 'https://dzsf.inca.com.cn/tencentcloud/queryTowStreamState',
                    data: this.liuState,
                    headers: {'token': '1'}
                }).then((res) => {
                    if (res.data.data.streamState === 'active') {
                        store.commit('user/SET_STREAMSTATE', res.data.data.streamState)
                        store.dispatch('user/createRecord', this.record).then(() => {
                            console.log('开启创建录制视频');
                            sessionStorage.setItem('hasCreate', true)
                            store.commit('user/SET_CREADSTATE', true)
                            setTimeout(()=>{
                                store.dispatch('user/startMixStream', this.record).then(()=>{
                                    console.log('开启混流');
                                    // this.localStream_.play('local_stream')
                                    // remoteStream.play('remote_stream')
                                }).catch(err=>{
                                    console.log(err);
                                })
                            },1000)
                        }).catch(err => {
                            store.commit('user/SET_CREADSTATE', false)
                            console.log(err);
                            sessionStorage.setItem('hasCreate', false)
                        })
                        // setTimeout(() => {
                        //     store.dispatch('user/startMixStream', this.record).then(() => {
                        //         store.dispatch('user/createRecord', this.record).then(()=>{
                        //             console.log('开启创建录制视频');
                        //             this.localStream_.play('local_stream')
                        //             remoteStream.play('remote_stream')
                        //             sessionStorage.setItem('hasCreate', true)
                        //             store.commit('user/SET_CREADSTATE', true)
                        //         }).catch(err=>{
                        //             console.log(err);
                        //             store.commit('user/SET_CREADSTATE', false)
                        //             sessionStorage.setItem('hasCreate', false)
                        //         })
                        //     }).catch(err => {
                        //         console.log(err);
                        //     })
                        // }, 2000)
                        clearInterval(timer)
                        return false
                    } else {
                        store.commit('user/SET_STREAMSTATE', '')
                    }
                }).catch(error => {
                    console.log(error)
                })
                count++

            },1000)
        })

        // 处理远端流被删除事件
        this.client_.on('stream-removed', evt => {
            const remoteStream = evt.stream
            const id = remoteStream.getId()
            // 关闭远端流内部的音视频播放器
            remoteStream.stop()
            this.remoteStreams_ = this.remoteStreams_.filter(stream => {
                return stream.getId() !== id
            })
            // removeView(id)
            console.log(`stream-removed ID: ${id}  type: ${remoteStream.getType()}`)
            // Message.info('远端流删除 - ' + remoteStream.getUserId())
            // 提醒门店端流断了
            console.log('远端流删除');
            // store.commit('user/SET_FLOWBROKEN', true)
            // store.dispatch('user/notifyShop', this.leaveRoom).then(() => {
            //     console.log('给门店发送请求成功');
            // }).catch(err=>{
            //     console.log(err);
            // })
        })

        // 处理远端流更新事件，在音视频通话过程中，远端流音频或视频可能会有更新
        this.client_.on('stream-updated', evt => {
            const remoteStream = evt.stream
            console.log(
                'type: ' +
                remoteStream.getType() +
                ' stream-updated hasAudio: ' +
                remoteStream.hasAudio() +
                ' hasVideo: ' +
                remoteStream.hasVideo()
            )
            // Message.info('远端流更新！')
        })

        // 远端流音频或视频mute状态通知
        this.client_.on('mute-audio', evt => {
            console.log(evt.userId + ' mute audio')
        })
        this.client_.on('unmute-audio', evt => {
            console.log(evt.userId + ' unmute audio')
        })
        this.client_.on('mute-video', evt => {
            console.log(evt.userId + ' mute video')
        })
        this.client_.on('unmute-video', evt => {
            console.log(evt.userId + ' unmute video')
        })

        // 信令通道连接状态通知
        this.client_.on('connection-state-changed', evt => {
            console.log(`RtcClient state changed to ${evt.state} from ${evt.prevState}`)
        })
    }
}
