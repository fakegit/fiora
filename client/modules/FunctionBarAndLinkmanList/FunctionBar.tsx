import React, { useState, useContext, useEffect, useRef } from 'react';

import IconButton from '../../components/IconButton';
import Avatar from '../../components/Avatar';
import { Tabs, TabPane, TabContent, ScrollableInkTabBar } from '../../components/Tabs';
import CreateGroup from './CreateGroup';
import { ShowUserOrGroupInfoContext } from '../../context';
import { search } from '../../service';

import Style from './FunctionBar.less';

function FunctionBar() {
    const [keywords, setKeywords] = useState('');
    const [addButtonVisible, toggleAddButtonVisible] = useState(true);
    const [searchResultVisible, toggleSearchResultVisible] = useState(false);
    const [searchResultActiveKey, setSearchResultActiveKey] = useState('all');
    const [createGroupDialogVisible, toggleCreateGroupDialogVisible] = useState(false);
    const [searchResult, setSearchResult] = useState({ users: [], groups: [] });

    const context = useContext(ShowUserOrGroupInfoContext);
    const $input = useRef(null);

    function resetSearch() {
        toggleSearchResultVisible(false);
        toggleAddButtonVisible(true);
        setSearchResultActiveKey('all');
        setSearchResult({ users: [], groups: [] });
        setKeywords('');
    }

    function handleBodyClick(e) {
        // eslint-disable-next-line react/destructuring-assignment
        if (e.target === $input.current || !searchResultVisible) {
            return;
        }

        const { currentTarget } = e;
        let { target } = e;
        do {
            if (target.className.indexOf(Style.searchResult) > -1) {
                return;
            }
            target = target.parentElement;
        } while (target && target !== currentTarget);

        resetSearch();
    }
    useEffect(() => {
        document.body.addEventListener('click', handleBodyClick, false);
        return () => {
            document.body.removeEventListener('click', handleBodyClick, false);
        };
    });

    function handleFocus() {
        toggleAddButtonVisible(false);
        toggleSearchResultVisible(true);
    }

    function handleInputKeyDown(e) {
        if (e.key === 'Enter') {
            setTimeout(async () => {
                const result = await search(keywords);
                if (result) {
                    setSearchResult(result);
                }
            }, 0);
        }
    }

    function renderSearchUsers(count = 999) {
        const { users } = searchResult;
        count = Math.min(count, users.length);

        function handleClick(targetUser) {
            context.showUserInfo(targetUser);
            resetSearch();
        }

        const usersDom = [];
        for (let i = 0; i < count; i++) {
            usersDom.push(
                <div
                    key={users[i]._id}
                    onClick={() => handleClick(users[i])}
                    role="button"
                >
                    <Avatar size={40} src={users[i].avatar} />
                    <p>{users[i].username}</p>
                </div>,
            );
        }
        return usersDom;
    }

    function renderSearchGroups(count = 999) {
        const { groups } = searchResult;
        count = Math.min(count, groups.length);

        function handleClick(targetGroup) {
            context.showGroupInfo(targetGroup);
            resetSearch();
        }

        const groupsDom = [];
        for (let i = 0; i < count; i++) {
            groupsDom.push(
                <div
                    key={groups[i]._id}
                    onClick={() => handleClick(groups[i])}
                    role="button"
                >
                    <Avatar size={40} src={groups[i].avatar} />
                    <div>
                        <p>{groups[i].name}</p>
                        <p>{groups[i].members}人</p>
                    </div>
                </div>,
            );
        }
        return groupsDom;
    }

    return (
        <div className={Style.functionBar}>
            <form className={Style.form} autoComplete="off" onSubmit={(e) => e.preventDefault()}>
                <input
                    className={`${Style.input} ${searchResultVisible ? 'focus' : 'blur'}`}
                    ref={$input}
                    type="text"
                    placeholder="搜索群组/用户"
                    value={keywords}
                    // @ts-ignore
                    onChange={(e) => setKeywords(e.target.value)}
                    onFocus={handleFocus}
                    onKeyDown={handleInputKeyDown}
                />
            </form>
            <i className={`iconfont icon-search ${Style.searchIcon}`} />
            <IconButton
                className={Style.createGroupButton}
                style={{ display: addButtonVisible ? 'block' : 'none' }}
                width={40}
                height={40}
                icon="add"
                iconSize={38}
                onClick={() => toggleCreateGroupDialogVisible(true)}
            />
            <Tabs
                className={Style.searchResult}
                style={{ display: searchResultVisible ? 'block' : 'none' }}
                activeKey={searchResultActiveKey}
                onChange={setSearchResultActiveKey}
                renderTabBar={() => <ScrollableInkTabBar />}
                renderTabContent={() => <TabContent />}
            >
                <TabPane tab="全部" key="all">
                    {searchResult.users.length === 0 && searchResult.groups.length === 0 ? (
                        <p className={Style.none}>没有搜索到内容, 换个关键字试试吧~~</p>
                    ) : (
                        <div className={Style.allList}>
                            <div
                                style={{
                                    display: searchResult.users.length > 0 ? 'block' : 'none',
                                }}
                            >
                                <p>用户</p>
                                <div className={Style.userList}>{renderSearchUsers(3)}</div>
                                <div
                                    className={Style.more}
                                    style={{
                                        display: searchResult.users.length > 3 ? 'block' : 'none',
                                    }}
                                >
                                    <span onClick={() => setSearchResultActiveKey('user')} role="button">
                                        查看更多
                                    </span>
                                </div>
                            </div>
                            <div
                                style={{
                                    display: searchResult.groups.length > 0 ? 'block' : 'none',
                                }}
                            >
                                <p>群组</p>
                                <div className={Style.groupList}>{renderSearchGroups(3)}</div>
                                <div
                                    className={Style.more}
                                    style={{
                                        display: searchResult.groups.length > 3 ? 'block' : 'none',
                                    }}
                                >
                                    <span onClick={() => setSearchResultActiveKey('group')} role="button">
                                        查看更多
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </TabPane>
                <TabPane tab="用户" key="user">
                    {searchResult.users.length === 0 ? (
                        <p className={Style.none}>没有搜索到内容, 换个关键字试试吧~~</p>
                    ) : (
                        <div className={`${Style.userList} ${Style.only}`}>{renderSearchUsers()}</div>
                    )}
                </TabPane>
                <TabPane tab="群组" key="group">
                    {searchResult.groups.length === 0 ? (
                        <p className={Style.none}>没有搜索到内容, 换个关键字试试吧~~</p>
                    ) : (
                        <div className={`${Style.groupList} ${Style.only}`}>{renderSearchGroups()}</div>
                    )}
                </TabPane>
            </Tabs>
            <CreateGroup
                visible={createGroupDialogVisible}
                onClose={() => toggleCreateGroupDialogVisible(false)}
            />
        </div>
    );
}

export default FunctionBar;
