import React from 'react'
import intl from 'react-intl-universal'
import { Link } from 'react-router-dom'

import { Container, Item } from '../../components/Grid/styles'
import { DetachedFab, DetachedText } from './styles'
import IconBot from '../../components/Icons/Bot'
import IconOnline from '../../components/Icons/Online'
import IconPeople from '../../components/Icons/People'

const HomePage = () => (
    <Container column center alignItems="center">
        <Item>
            <DetachedFab variant="extended" color="primary" component={Link} to="/online">
                <IconOnline />
                <DetachedText>{intl.get('home.online')}</DetachedText>
            </DetachedFab>
        </Item>
        <Item>
            <DetachedFab variant="extended" color="secondary" component={Link} to="/ai">
                <IconBot />
                <DetachedText>{intl.get('home.game_vs_ai')}</DetachedText>
            </DetachedFab>
        </Item>
        <Item>
            <DetachedFab variant="extended" component={Link} to="/local">
                <IconPeople />
                <DetachedText>{intl.get('home.local')}</DetachedText>
            </DetachedFab>
        </Item>
    </Container>
)

export default HomePage
